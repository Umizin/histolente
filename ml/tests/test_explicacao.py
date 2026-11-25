"""Testes do resumo medido do mapa Grad-CAM (leitura "Como ler este mapa")."""
from __future__ import annotations

import numpy as np
import pytest

from histolente_ml.cor import ReferenciaCor
from histolente_ml.explicacao import resumir_mapa

HE = np.array([[0.65, 0.70, 0.29], [0.07, 0.99, 0.11]])
HE = HE / np.linalg.norm(HE, axis=1, keepdims=True)


def mistura(conc_h: np.ndarray, conc_e: np.ndarray) -> np.ndarray:
    od = HE.T @ np.stack([conc_h.ravel(), conc_e.ravel()])
    return np.clip(256.0 * np.exp(-od) - 1.0, 0, 255).T.reshape(*conc_h.shape, 3).astype(np.uint8)


def metade_nuclear() -> np.ndarray:
    """Metade esquerda rica em hematoxilina (núcleos), metade direita rica em eosina."""
    rng = np.random.default_rng(0)
    h = rng.gamma(2.0, 0.1, (224, 224))
    e = rng.gamma(2.0, 0.1, (224, 224))
    h[:, :112] += 0.9
    e[:, 112:] += 0.6
    return mistura(h, e)


REF = ReferenciaCor.carregar()


def test_mapa_constante_nao_tem_regiao() -> None:
    assert resumir_mapa(np.zeros((224, 224)), metade_nuclear(), REF) is None


def test_regiao_sobre_os_nucleos() -> None:
    mapa = np.zeros((224, 224))
    mapa[:, :112] = 1.0
    r = resumir_mapa(mapa, metade_nuclear(), REF)
    assert r is not None
    assert r["hot_fraction"] == pytest.approx(0.5, abs=0.01)
    cx, cy = r["centroid"]  # type: ignore[misc]
    assert cx < 0.3 and 0.45 < cy < 0.55
    assert r["hematoxylin_ratio"] is not None and r["hematoxylin_ratio"] > 1.5  # type: ignore[operator]
    assert r["eosin_ratio"] is not None and r["eosin_ratio"] < 1  # type: ignore[operator]


def test_regiao_sobre_espaco_claro() -> None:
    img = metade_nuclear()
    img[:, 112:] = 250  # metade direita vira vidro
    mapa = np.zeros((224, 224))
    mapa[:, 112:] = 1.0
    r = resumir_mapa(mapa, img, REF)
    assert r is not None
    assert r["background_hot"] > 0.9 and r["background_rest"] < 0.1  # type: ignore[operator]


def test_regiao_do_tamanho_do_recorte_nao_compara() -> None:
    mapa = np.ones((224, 224))
    mapa[0, 0] = 0.0  # quase tudo acima do limiar
    r = resumir_mapa(mapa, metade_nuclear(), REF)
    assert r is not None and r["hematoxylin_ratio"] is None and r["eosin_ratio"] is None


def test_tamanhos_diferentes_sao_recusados() -> None:
    with pytest.raises(ValueError):
        resumir_mapa(np.zeros((7, 7)), metade_nuclear(), REF)
