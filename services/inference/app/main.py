"""API de saúde do serviço de inferência: /healthz, /readyz e /model. Inicia o consumidor no startup."""
from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import torch
from fastapi import FastAPI, Response

from .config import Config
from .consumidor import Consumidor
from .modelo import Classificador

logging.basicConfig(level=logging.INFO, format='{"nivel":"%(levelname)s","msg":"%(message)s"}')
cfg = Config()
estado: dict[str, object] = {}


@asynccontextmanager
async def ciclo(_: FastAPI) -> AsyncIterator[None]:
    torch.set_num_threads(cfg.threads_torch)
    clf = Classificador(cfg.pasta_modelos)  # carrega e aquece antes de aceitar jobs
    consumidor = Consumidor(cfg, clf)
    await consumidor.iniciar()
    estado.update(clf=clf, consumidor=consumidor)
    yield
    await consumidor.parar()


app = FastAPI(title="HistoLente — serviço de inferência", lifespan=ciclo)


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/readyz")
def readyz(response: Response) -> dict[str, bool]:
    pronto = bool(estado.get("consumidor") and estado["consumidor"].pronto)  # type: ignore[attr-defined]
    response.status_code = 200 if pronto else 503
    return {"pronto": pronto}


@app.get("/model")
def model() -> dict[str, object]:
    clf = estado["clf"]
    i = clf.info  # type: ignore[attr-defined]
    return {"nome": i.nome, "versao": i.versao, "sha256": i.sha256, "backbone": i.backbone,
            "camada_gradcam": i.camada, "preliminar": i.preliminar}
