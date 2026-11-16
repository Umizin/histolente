"""Mede a latência por patch (pré-processamento + inferência + Grad-CAM) — referência para o RNF01."""
from __future__ import annotations

import platform
import time

import numpy as np
import torch
from PIL import Image

from .dados import transformacao_avaliacao
from .gradcam import GradCAM
from .modelos import camada_alvo


def medir(modelo: torch.nn.Module, backbone: str, dispositivo: str = "cpu", repeticoes: int = 50,
          aquecimento: int = 5, threads: int | None = None) -> dict[str, object]:
    if threads:
        torch.set_num_threads(threads)
    modelo = modelo.eval().to(dispositivo)
    _, camada = camada_alvo(modelo, backbone)
    cam = GradCAM(modelo, camada)
    tf = transformacao_avaliacao()
    img = Image.fromarray((np.random.default_rng(0).random((224, 224, 3)) * 255).astype("uint8"))
    tempos: dict[str, list[float]] = {"preprocess": [], "inferencia": [], "gradcam": [], "total": []}
    for i in range(aquecimento + repeticoes):
        t0 = time.perf_counter()
        x = tf(img).unsqueeze(0).to(dispositivo)
        t1 = time.perf_counter()
        with torch.inference_mode():
            modelo(x)
        t2 = time.perf_counter()
        cam(x)
        if dispositivo == "cuda":
            torch.cuda.synchronize()
        t3 = time.perf_counter()
        if i >= aquecimento:
            tempos["preprocess"].append((t1 - t0) * 1000)
            tempos["inferencia"].append((t2 - t1) * 1000)
            tempos["gradcam"].append((t3 - t2) * 1000)
            tempos["total"].append((t3 - t0) * 1000)
    cam.remover()
    resumo = {k: {"p50": float(np.percentile(v, 50)), "p95": float(np.percentile(v, 95))} for k, v in tempos.items()}
    return {
        "backbone": backbone,
        "dispositivo": dispositivo,
        "threads": torch.get_num_threads(),
        "processador": platform.processor() or platform.machine(),
        "repeticoes": repeticoes,
        "ms": resumo,
        "meta_rnf01_p95_ms": 500,
        "atende_rnf01": resumo["total"]["p95"] < 500,
    }
