"""Resumo medido do mapa Grad-CAM, para a leitura "Como ler este mapa" da interface.

O Grad-CAM mostra ONDE a rede se apoiou, não POR QUÊ. Este módulo não tenta adivinhar o raciocínio do modelo:
ele só mede (1) onde fica e quanto do recorte ocupa a região de maior influência e (2) o que há nessa região,
separando a hematoxilina (núcleos) da eosina (citoplasma, fibras, matriz) pela deconvolução de cor de
Macenko et al. (2009). A ligação entre a região e os critérios morfológicos fica com o estudante.
"""
from __future__ import annotations

import numpy as np

from .cor import BETA, ReferenciaCor, densidade_optica, estimar_manchas

LIMIAR_MAPA = 0.5  # região de maior influência: mapa normalizado ≥ 50% do máximo
MIN_PIXELS = 200  # região ou restante menor que isso não permite comparar


def _razao(a: np.ndarray, b: np.ndarray) -> float | None:
    if a.size < MIN_PIXELS or b.size < MIN_PIXELS:
        return None
    ma, mb = float(a.mean()), float(b.mean())
    if mb < 0.02:  # restante praticamente sem o corante: a razão não tem sentido
        return None
    return round(ma / mb, 3)


def resumir_mapa(mapa: np.ndarray, rgb: np.ndarray, ref: ReferenciaCor) -> dict[str, object] | None:
    """mapa: H×W em [0, 1] (mesma geometria da imagem); rgb: H×W×3 uint8 do recorte original.

    Retorna None quando o mapa é constante (por exemplo, fundo sem tecido), caso em que não há região a descrever.
    """
    if mapa.shape != rgb.shape[:2]:
        raise ValueError("mapa e imagem precisam ter o mesmo tamanho")
    if float(mapa.max()) - float(mapa.min()) < 1e-6:
        return None
    quente = mapa >= LIMIAR_MAPA
    h, w = mapa.shape
    ys, xs = np.nonzero(quente)
    od = densidade_optica(rgb)
    fundo = od.mean(axis=2) < BETA  # pixel claro: vidro ou espaço sem tecido corado

    m = estimar_manchas(rgb)
    he = m.he if m is not None else ref.manchas.he  # vetores da própria imagem; sem tecido suficiente, os do treino
    conc = np.linalg.lstsq(he.T, od.reshape(-1, 3).T, rcond=None)[0].clip(min=0).reshape(2, h, w)
    resto = ~quente

    return {
        "hot_fraction": round(float(quente.mean()), 4),
        "centroid": [round(float(xs.mean()) / (w - 1), 3), round(float(ys.mean()) / (h - 1), 3)],
        "background_hot": round(float(fundo[quente].mean()), 3),
        "background_rest": round(float(fundo[resto].mean()), 3) if resto.any() else None,
        "hematoxylin_ratio": _razao(conc[0][quente], conc[0][resto]),
        "eosin_ratio": _razao(conc[1][quente], conc[1][resto]),
    }
