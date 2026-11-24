"""Consumidor AMQP: inference.request → análise → inference.completed (EN04).

- ack manual só depois de publicar o resultado;
- prefetch limita quantas imagens o serviço processa ao mesmo tempo (proteção contra falta de memória);
- até MAX_TENTATIVAS; na última, publica status FAILED (o RabbitMQ não gera eventos de domínio).
"""
from __future__ import annotations

import asyncio
import base64
import json
import logging
from datetime import datetime, timezone

import aio_pika
from aio_pika.abc import AbstractIncomingMessage

from .config import Config
from .modelo import Classificador

log = logging.getLogger("inference")

EXCHANGE, EXCHANGE_DLX = "inference", "inference.dlx"
FILA_REQUEST, FILA_COMPLETED, FILA_DLQ = "inference.request", "inference.completed", "inference.dlq"


def _agora() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


async def declarar_topologia(canal: aio_pika.abc.AbstractChannel) -> aio_pika.abc.AbstractExchange:
    """Mesma topologia de infra/rabbitmq/topologia.py (declaração idempotente)."""
    ex = await canal.declare_exchange(EXCHANGE, aio_pika.ExchangeType.DIRECT, durable=True)
    dlx = await canal.declare_exchange(EXCHANGE_DLX, aio_pika.ExchangeType.DIRECT, durable=True)
    req = await canal.declare_queue(FILA_REQUEST, durable=True, arguments={
        "x-dead-letter-exchange": EXCHANGE_DLX, "x-dead-letter-routing-key": FILA_REQUEST})
    comp = await canal.declare_queue(FILA_COMPLETED, durable=True, arguments={
        "x-dead-letter-exchange": EXCHANGE_DLX, "x-dead-letter-routing-key": FILA_COMPLETED})
    dlq = await canal.declare_queue(FILA_DLQ, durable=True)
    await req.bind(ex, "request")
    await comp.bind(ex, "completed")
    await dlq.bind(dlx, FILA_REQUEST)
    await dlq.bind(dlx, FILA_COMPLETED)
    return ex


class Consumidor:
    def __init__(self, cfg: Config, clf: Classificador) -> None:
        self.cfg, self.clf = cfg, clf
        self.conexao: aio_pika.abc.AbstractRobustConnection | None = None
        self.pronto = False

    async def iniciar(self) -> None:
        self.conexao = await aio_pika.connect_robust(self.cfg.amqp_url)
        canal = await self.conexao.channel()
        await canal.set_qos(prefetch_count=self.cfg.prefetch)
        self.exchange = await declarar_topologia(canal)
        fila = await canal.get_queue(FILA_REQUEST)
        await fila.consume(self._ao_receber)
        self.pronto = True
        log.info("consumindo %s (prefetch=%s, modelo %s %s)", FILA_REQUEST, self.cfg.prefetch,
                 self.clf.info.nome, self.clf.info.versao)

    async def parar(self) -> None:
        if self.conexao:
            await self.conexao.close()

    async def _publicar(self, corpo: dict[str, object], correlation_id: str | None) -> None:
        await self.exchange.publish(
            aio_pika.Message(json.dumps(corpo).encode(), content_type="application/json",
                             delivery_mode=aio_pika.DeliveryMode.PERSISTENT, correlation_id=correlation_id),
            routing_key="completed")

    def _base(self, req: dict[str, object]) -> dict[str, object]:
        i = self.clf.info
        return {"schema_version": "1.0", "job_id": req["job_id"], "analysis_id": req["analysis_id"],
                "model": {"name": i.nome, "version": i.versao, "sha256": i.sha256},
                "completed_at": _agora(), "correlation_id": req.get("correlation_id", req["job_id"])}

    async def _ao_receber(self, msg: AbstractIncomingMessage) -> None:
        try:
            req = json.loads(msg.body)
        except json.JSONDecodeError:
            log.error("mensagem inválida descartada para a DLQ")
            await msg.reject(requeue=False)
            return
        tentativa = int((msg.headers or {}).get("x-tentativa", 1))
        try:
            imagem = base64.b64decode(str(req["image_b64"]))
            resultado = await asyncio.to_thread(self.clf.analisar, imagem, req.get("target_class"))
            await self._publicar({**self._base(req), "status": "DONE", **resultado, "error": None}, msg.correlation_id)
            await msg.ack()
            log.info("job %s concluído: %s (%.0f ms)", req["job_id"], resultado["predicted_class"],
                     resultado["timings_ms"]["total_worker"])  # type: ignore[index]
        except Exception as erro:  # noqa: BLE001 — qualquer falha vira nova tentativa ou FAILED
            log.warning("job %s falhou (tentativa %s): %s", req.get("job_id"), tentativa, erro)
            if tentativa < self.cfg.max_tentativas and not isinstance(erro, ValueError):
                await asyncio.sleep(tentativa)  # espera crescente simples (filas de espera: Sprint 2b)
                await self.exchange.publish(
                    aio_pika.Message(msg.body, headers={"x-tentativa": tentativa + 1}, content_type="application/json",
                                     delivery_mode=aio_pika.DeliveryMode.PERSISTENT, correlation_id=msg.correlation_id),
                    routing_key="request")
                await msg.ack()
            else:
                await self._publicar({**self._base(req), "status": "FAILED", "error": str(erro)[:500]}, msg.correlation_id)
                await msg.reject(requeue=False)  # auditoria na DLQ
