"""Treinamento com semente fixa, early stopping e histórico em JSON."""
from __future__ import annotations

import json
import os
import random
import time
from dataclasses import asdict, dataclass, field
from pathlib import Path

import numpy as np
import torch
from torch import nn
from torch.utils.data import DataLoader

from . import CLASSES
from .dados import DatasetPatches, ler_csv, transformacao_avaliacao, transformacao_treino
from .modelos import criar


@dataclass
class ConfigTreino:
    raiz_dados: str
    csv_treino: str
    csv_val: str
    saida: str
    backbone: str = "resnet18"
    pretreinado: bool = True
    epocas: int = 10
    lote: int = 64
    taxa_aprendizado: float = 3e-4
    decaimento: float = 1e-4
    paciencia: int = 3
    semente: int = 42
    workers: int = 4
    dispositivo: str = field(default_factory=lambda: "cuda" if torch.cuda.is_available() else "cpu")


def fixar_sementes(semente: int) -> None:
    random.seed(semente)
    np.random.seed(semente)
    torch.manual_seed(semente)
    torch.cuda.manual_seed_all(semente)
    os.environ["PYTHONHASHSEED"] = str(semente)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


def _epoca(modelo: nn.Module, carregador: DataLoader, perda_fn: nn.Module, dispositivo: str,
           otimizador: torch.optim.Optimizer | None, escalador: torch.amp.GradScaler | None
           ) -> tuple[float, float]:
    treinando = otimizador is not None
    modelo.train(treinando)
    soma_perda, acertos, total = 0.0, 0, 0
    usa_amp = dispositivo == "cuda"
    with torch.set_grad_enabled(treinando):
        for x, y in carregador:
            x, y = x.to(dispositivo, non_blocking=True), y.to(dispositivo, non_blocking=True)
            with torch.autocast(device_type="cuda", enabled=usa_amp):
                saida = modelo(x)
                perda = perda_fn(saida, y)
            if treinando:
                assert otimizador is not None
                otimizador.zero_grad(set_to_none=True)
                if escalador is not None:
                    escalador.scale(perda).backward()
                    escalador.step(otimizador)
                    escalador.update()
                else:
                    perda.backward()
                    otimizador.step()
            soma_perda += perda.item() * y.size(0)
            acertos += (saida.argmax(1) == y).sum().item()
            total += y.size(0)
    return soma_perda / total, acertos / total


def treinar(cfg: ConfigTreino) -> dict[str, object]:
    fixar_sementes(cfg.semente)
    saida = Path(cfg.saida)
    saida.mkdir(parents=True, exist_ok=True)
    raiz = Path(cfg.raiz_dados)

    ds_tr = DatasetPatches(raiz, ler_csv(Path(cfg.csv_treino)), transformacao_treino())
    ds_val = DatasetPatches(raiz, ler_csv(Path(cfg.csv_val)), transformacao_avaliacao())
    g = torch.Generator().manual_seed(cfg.semente)
    dl_tr = DataLoader(ds_tr, batch_size=cfg.lote, shuffle=True, num_workers=cfg.workers, generator=g,
                       pin_memory=cfg.dispositivo == "cuda")
    dl_val = DataLoader(ds_val, batch_size=cfg.lote, shuffle=False, num_workers=cfg.workers)

    modelo = criar(cfg.backbone, cfg.pretreinado).to(cfg.dispositivo)
    perda_fn = nn.CrossEntropyLoss()
    otimizador = torch.optim.AdamW(modelo.parameters(), lr=cfg.taxa_aprendizado, weight_decay=cfg.decaimento)
    agendador = torch.optim.lr_scheduler.CosineAnnealingLR(otimizador, T_max=cfg.epocas)
    escalador = torch.amp.GradScaler("cuda") if cfg.dispositivo == "cuda" else None

    historico: list[dict[str, float]] = []
    melhor, sem_melhora = -1.0, 0
    inicio = time.perf_counter()
    for ep in range(1, cfg.epocas + 1):
        t0 = time.perf_counter()
        p_tr, a_tr = _epoca(modelo, dl_tr, perda_fn, cfg.dispositivo, otimizador, escalador)
        p_val, a_val = _epoca(modelo, dl_val, perda_fn, cfg.dispositivo, None, None)
        agendador.step()
        historico.append({"epoca": ep, "perda_treino": p_tr, "acc_treino": a_tr, "perda_val": p_val,
                          "acc_val": a_val, "segundos": time.perf_counter() - t0})
        print(f"época {ep:02d} | perda {p_tr:.4f}/{p_val:.4f} | acc {a_tr:.4f}/{a_val:.4f}", flush=True)
        if a_val > melhor:
            melhor, sem_melhora = a_val, 0
            torch.save(modelo.state_dict(), saida / "melhor.pt")
        else:
            sem_melhora += 1
            if sem_melhora >= cfg.paciencia:
                print(f"early stopping na época {ep}", flush=True)
                break

    resumo = {
        "config": asdict(cfg),
        "classes": list(CLASSES),
        "n_treino": len(ds_tr),
        "n_val": len(ds_val),
        "melhor_acc_val": melhor,
        "epocas_executadas": len(historico),
        "segundos_total": time.perf_counter() - inicio,
        "historico": historico,
        "versoes": {"torch": torch.__version__, "cuda": torch.version.cuda},
    }
    (saida / "treino.json").write_text(json.dumps(resumo, indent=2, ensure_ascii=False), encoding="utf-8")
    return resumo
