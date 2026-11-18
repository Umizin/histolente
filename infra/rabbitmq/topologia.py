"""Topologia do RabbitMQ do HistoLente (EN02).

PENDENTE (Sprint 2, docs/projeto/01-arquitetura.md §1.5 e SQ3): fila inference.request do tipo quorum com
x-delivery-limit, filas de espera inference.request.retry.{1s,5s} e evento inference.started na mesma fila
de eventos de inference.completed.

Publicador (backend) e consumidor (serviço de inferência) chamam `declarar(canal)` ao iniciar.
A declaração é idempotente: se as filas já existem com os mesmos argumentos, nada muda.

    inference (direct) --"request"-->   inference.request   --(rejeitada)--> inference.dlx --> inference.dlq
                       --"completed"--> inference.completed --(rejeitada)--> inference.dlx --> inference.dlq
"""
from __future__ import annotations

from typing import Any, Final

EXCHANGE: Final = "inference"
EXCHANGE_DLX: Final = "inference.dlx"
FILA_REQUEST: Final = "inference.request"
FILA_COMPLETED: Final = "inference.completed"
FILA_DLQ: Final = "inference.dlq"
CHAVE_REQUEST: Final = "request"
CHAVE_COMPLETED: Final = "completed"
MAX_TENTATIVAS: Final = 3  # depois disso o consumidor rejeita sem reenfileirar e a mensagem vai para a DLQ


def _args_dlx(fila: str) -> dict[str, Any]:
    return {"x-dead-letter-exchange": EXCHANGE_DLX, "x-dead-letter-routing-key": fila}


def declarar(canal: Any) -> None:
    """Declara exchanges, filas e ligações. `canal` é um canal pika (BlockingChannel)."""
    canal.exchange_declare(exchange=EXCHANGE, exchange_type="direct", durable=True)
    canal.exchange_declare(exchange=EXCHANGE_DLX, exchange_type="direct", durable=True)

    canal.queue_declare(queue=FILA_REQUEST, durable=True, arguments=_args_dlx(FILA_REQUEST))
    canal.queue_declare(queue=FILA_COMPLETED, durable=True, arguments=_args_dlx(FILA_COMPLETED))
    canal.queue_declare(queue=FILA_DLQ, durable=True)

    canal.queue_bind(queue=FILA_REQUEST, exchange=EXCHANGE, routing_key=CHAVE_REQUEST)
    canal.queue_bind(queue=FILA_COMPLETED, exchange=EXCHANGE, routing_key=CHAVE_COMPLETED)
    canal.queue_bind(queue=FILA_DLQ, exchange=EXCHANGE_DLX, routing_key=FILA_REQUEST)
    canal.queue_bind(queue=FILA_DLQ, exchange=EXCHANGE_DLX, routing_key=FILA_COMPLETED)
