from __future__ import annotations

import os
from dataclasses import dataclass, field


def _env(nome: str, padrao: str) -> str:
    return os.environ.get(nome, padrao)


@dataclass(frozen=True)
class Config:
    """Configuração por variáveis de ambiente (12-factor). Nada de credencial de banco aqui (RNF06)."""

    amqp_url: str = field(default_factory=lambda: _env("AMQP_URL", "amqp://guest:guest@localhost:5672/%2F"))
    pasta_modelos: str = field(default_factory=lambda: _env("MODEL_DIR", "/models"))
    prefetch: int = field(default_factory=lambda: int(_env("PREFETCH", "1")))
    max_tentativas: int = field(default_factory=lambda: int(_env("MAX_TENTATIVAS", "3")))
    threads_torch: int = field(default_factory=lambda: int(_env("TORCH_THREADS", "4")))
