"""Avaliação no conjunto de teste independente, com intervalos de confiança e calibração."""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import torch
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    classification_report,
    cohen_kappa_score,
    confusion_matrix,
    f1_score,
    roc_auc_score,
)
from torch import nn
from torch.utils.data import DataLoader

from . import CLASSES
from .dados import DatasetPatches, transformacao_avaliacao


@torch.inference_mode()
def prever(modelo: nn.Module, ds: DatasetPatches, dispositivo: str, lote: int = 128, workers: int = 4
           ) -> tuple[np.ndarray, np.ndarray]:
    """Retorna (rótulos verdadeiros, probabilidades N×9)."""
    modelo.eval().to(dispositivo)
    ys, ps = [], []
    for x, y in DataLoader(ds, batch_size=lote, shuffle=False, num_workers=workers):
        ps.append(torch.softmax(modelo(x.to(dispositivo)), 1).cpu().numpy())
        ys.append(y.numpy())
    return np.concatenate(ys), np.concatenate(ps)


def ece(y: np.ndarray, p: np.ndarray, faixas: int = 15) -> float:
    """Expected Calibration Error: diferença média entre confiança e acerto, por faixa de confiança."""
    conf = p.max(1)
    acerto = (p.argmax(1) == y).astype(float)
    limites = np.linspace(0, 1, faixas + 1)
    total = 0.0
    for a, b in zip(limites[:-1], limites[1:]):
        m = (conf > a) & (conf <= b)
        if m.any():
            total += m.mean() * abs(acerto[m].mean() - conf[m].mean())
    return float(total)


def bootstrap_ic95(y: np.ndarray, pred: np.ndarray, n: int = 1000, semente: int = 0) -> dict[str, list[float]]:
    rng = np.random.default_rng(semente)
    accs, f1s = [], []
    for _ in range(n):
        i = rng.integers(0, len(y), len(y))
        accs.append(accuracy_score(y[i], pred[i]))
        f1s.append(f1_score(y[i], pred[i], average="macro", labels=list(range(len(CLASSES))), zero_division=0))
    q = lambda v: [float(np.percentile(v, 2.5)), float(np.percentile(v, 97.5))]  # noqa: E731
    return {"accuracy": q(accs), "f1_macro": q(f1s)}


def metricas(y: np.ndarray, p: np.ndarray, n_bootstrap: int = 1000) -> dict[str, object]:
    pred = p.argmax(1)
    rotulos = list(range(len(CLASSES)))
    rel = classification_report(y, pred, labels=rotulos, target_names=list(CLASSES), output_dict=True, zero_division=0)
    cm = confusion_matrix(y, pred, labels=rotulos)
    presentes = np.unique(y)
    try:
        auc = float(roc_auc_score(y, p, multi_class="ovr", labels=rotulos, average="macro")) if len(presentes) == len(CLASSES) else None
    except ValueError:
        auc = None
    i_tum, i_norm = CLASSES.index("TUM"), CLASSES.index("NORM")
    return {
        "n": int(len(y)),
        "accuracy": float(accuracy_score(y, pred)),
        "balanced_accuracy": float(balanced_accuracy_score(y, pred)),
        "f1_macro": float(f1_score(y, pred, average="macro", labels=rotulos, zero_division=0)),
        "f1_weighted": float(f1_score(y, pred, average="weighted", labels=rotulos, zero_division=0)),
        "cohen_kappa": float(cohen_kappa_score(y, pred)),
        "roc_auc_ovr_macro": auc,
        "ece": ece(y, p),
        "ic95_bootstrap": bootstrap_ic95(y, pred, n_bootstrap),
        "por_classe": {c: {k: float(v) for k, v in rel[c].items()} for c in CLASSES},
        # Pedido da elicitação: "não deixar passar tumor evidente"
        "sensibilidade_TUM": float(rel["TUM"]["recall"]),
        "confusao_NORM_TUM": {"NORM_previsto_como_TUM": int(cm[i_norm, i_tum]), "TUM_previsto_como_NORM": int(cm[i_tum, i_norm])},
        "matriz_confusao": cm.tolist(),
        "classes": list(CLASSES),
    }


def salvar_figura_matriz(cm: list[list[int]], destino: Path) -> None:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    m = np.array(cm, dtype=float)
    norm = m / np.clip(m.sum(1, keepdims=True), 1, None)
    fig, ax = plt.subplots(figsize=(7, 6))
    im = ax.imshow(norm, cmap="viridis", vmin=0, vmax=1)
    ax.set_xticks(range(len(CLASSES)), CLASSES, rotation=45)
    ax.set_yticks(range(len(CLASSES)), CLASSES)
    ax.set_xlabel("Classe prevista")
    ax.set_ylabel("Classe verdadeira")
    for i in range(len(CLASSES)):
        for j in range(len(CLASSES)):
            ax.text(j, i, f"{norm[i, j]:.2f}", ha="center", va="center", fontsize=7,
                    color="white" if norm[i, j] < 0.6 else "black")
    fig.colorbar(im, ax=ax, fraction=0.046)
    fig.tight_layout()
    destino.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(destino, dpi=200)
    plt.close(fig)


def avaliar(modelo: nn.Module, raiz: Path, itens: list[tuple[str, str]], saida: Path, dispositivo: str,
            n_bootstrap: int = 1000, workers: int = 4) -> dict[str, object]:
    ds = DatasetPatches(raiz, itens, transformacao_avaliacao())
    y, p = prever(modelo, ds, dispositivo, workers=workers)
    res = metricas(y, p, n_bootstrap)
    saida.mkdir(parents=True, exist_ok=True)
    (saida / "metricas.json").write_text(json.dumps(res, indent=2, ensure_ascii=False), encoding="utf-8")
    salvar_figura_matriz(res["matriz_confusao"], saida / "matriz_confusao.png")  # type: ignore[arg-type]
    return res
