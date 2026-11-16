"""Verificação de ponta a ponta do ambiente (EN02).

Roda dentro do contêiner `verificador` do docker-compose, ligado às redes backend_net e mq_net.
"""
from __future__ import annotations

import json
import os
import sys
import time
import uuid
from pathlib import Path

import pika
import psycopg
import pytest
import redis

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "rabbitmq"))
import topologia  # noqa: E402

TABELAS = {"users", "model_versions", "images", "batches", "analyses", "consents", "quiz_attempts"}


# ------------------------------------------------------------------ PostgreSQL
def test_postgres_tem_o_schema() -> None:
    with psycopg.connect(os.environ["POSTGRES_DSN"]) as con:
        linhas = con.execute(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        ).fetchall()
    assert TABELAS <= {l[0] for l in linhas}


def test_postgres_recusa_duas_versoes_ativas() -> None:
    with psycopg.connect(os.environ["POSTGRES_DSN"]) as con:
        with pytest.raises(psycopg.errors.UniqueViolation):
            with con.transaction():
                for v in ("9.9.1", "9.9.2"):
                    con.execute(
                        "INSERT INTO model_versions (name, version, file_sha256, backbone, active) "
                        "VALUES ('teste', %s, %s, 'resnet18', true)",
                        (v, "0" * 64),
                    )


# ------------------------------------------------------------------ Redis
def test_redis_cache_com_ttl() -> None:
    r = redis.Redis.from_url(os.environ["REDIS_URL"])
    chave = f"cache:sha256:{'a' * 64}:0.0.0-teste"
    r.set(chave, json.dumps({"ok": True}), ex=5)
    assert json.loads(r.get(chave)) == {"ok": True}
    assert 0 < r.ttl(chave) <= 5
    assert r.config_get("maxmemory-policy")["maxmemory-policy"] == "allkeys-lru"
    r.delete(chave)


def test_redis_pubsub() -> None:
    r = redis.Redis.from_url(os.environ["REDIS_URL"])
    canal = f"job:{uuid.uuid4()}"
    sub = r.pubsub()
    sub.subscribe(canal)
    sub.get_message(timeout=1)  # confirmação da inscrição
    r.publish(canal, "completed")
    msg = None
    for _ in range(20):
        msg = sub.get_message(timeout=0.5)
        if msg and msg["type"] == "message":
            break
    assert msg and msg["data"] == b"completed"
    sub.close()


# ------------------------------------------------------------------ RabbitMQ
@pytest.fixture()
def canal():
    con = pika.BlockingConnection(pika.URLParameters(os.environ["AMQP_URL"]))
    ch = con.channel()
    topologia.declarar(ch)
    for f in (topologia.FILA_REQUEST, topologia.FILA_COMPLETED, topologia.FILA_DLQ):
        ch.queue_purge(f)
    yield ch
    con.close()


def _pegar(ch, fila: str, tentativas: int = 20):
    for _ in range(tentativas):
        m, p, corpo = ch.basic_get(fila, auto_ack=False)
        if m:
            return m, p, corpo
        time.sleep(0.2)
    return None, None, None


def test_rabbit_entrega_request_persistente(canal) -> None:
    job = str(uuid.uuid4())
    canal.basic_publish(
        topologia.EXCHANGE, topologia.CHAVE_REQUEST, json.dumps({"job_id": job}).encode(),
        pika.BasicProperties(delivery_mode=2, content_type="application/json"),
    )
    m, props, corpo = _pegar(canal, topologia.FILA_REQUEST)
    assert m is not None and json.loads(corpo)["job_id"] == job
    assert props.delivery_mode == 2
    canal.basic_ack(m.delivery_tag)


def test_rabbit_mensagem_rejeitada_vai_para_dlq(canal) -> None:
    job = str(uuid.uuid4())
    canal.basic_publish(topologia.EXCHANGE, topologia.CHAVE_REQUEST, json.dumps({"job_id": job}).encode(),
                        pika.BasicProperties(delivery_mode=2))
    m, _, _ = _pegar(canal, topologia.FILA_REQUEST)
    assert m is not None
    canal.basic_nack(m.delivery_tag, requeue=False)  # falhou de vez (após MAX_TENTATIVAS)
    m2, _, corpo = _pegar(canal, topologia.FILA_DLQ)
    assert m2 is not None and json.loads(corpo)["job_id"] == job
    canal.basic_ack(m2.delivery_tag)


def test_rabbit_topologia_e_idempotente(canal) -> None:
    topologia.declarar(canal)  # segunda declaração não pode falhar
