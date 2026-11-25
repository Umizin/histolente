"""Testes da normalização de cor (Macenko) e da verificação de coloração fora do padrão (RF17, risco R01).

As imagens são sintéticas: concentrações aleatórias de hematoxilina e eosina misturadas com vetores conhecidos,
o que permite saber de antemão quais vetores o método deveria recuperar.
"""
from __future__ import annotations

import numpy as np
import pytest

from histolente_ml import CLASSES
from histolente_ml.cor import (
    Manchas,
    ReferenciaCor,
    angulos,
    calcular_referencia,
    estimar_manchas,
    fora_do_padrao,
    normalizar,
    preparar,
)

HE_REF = np.array([[0.65, 0.70, 0.29], [0.07, 0.99, 0.11]])
HE_REF = HE_REF / np.linalg.norm(HE_REF, axis=1, keepdims=True)


def sintetica(he: np.ndarray, escala: float = 1.0, semente: int = 0, fundo: float = 0.0) -> np.ndarray:
    rng = np.random.default_rng(semente)
    n = 224 * 224
    conc = np.stack([rng.gamma(2.0, 0.35, n), rng.gamma(2.0, 0.25, n)]) * escala
    if fundo:
        conc[:, rng.random(n) < fundo] = 0.0
    rgb = 256.0 * np.exp(-(he.T @ conc)) - 1.0
    return np.clip(rgb.T.reshape(224, 224, 3), 0, 255).astype(np.uint8)


def referencia(limiar: float = 3.0) -> ReferenciaCor:
    m = estimar_manchas(sintetica(HE_REF))
    assert m is not None
    return ReferenciaCor(he=m.he.tolist(), max_c=m.max_c.tolist(),
                         limiares={c: [limiar, limiar] for c in CLASSES}, n_imagens=1, origem="teste")


def girar(he: np.ndarray, graus: float) -> np.ndarray:
    """Gira o vetor de eosina em direção ao de hematoxilina (muda o tom, como outro protocolo de coloração)."""
    t = np.radians(graus)
    e = np.cos(t) * he[1] + np.sin(t) * he[0]
    return np.array([he[0], e / np.linalg.norm(e)])


def test_recupera_os_vetores_da_mistura() -> None:
    m = estimar_manchas(sintetica(HE_REF))
    assert m is not None
    h, e = angulos(m, Manchas(HE_REF, np.ones(2)))
    assert h < 8 and e < 8  # Macenko aproxima os extremos; não precisa ser exato


def test_pouco_tecido_nao_e_estimado() -> None:
    assert estimar_manchas(sintetica(HE_REF, fundo=0.99)) is None
    r = preparar(sintetica(HE_REF, fundo=0.99), referencia())
    assert not r.estimada and not fora_do_padrao(r, "TUM", referencia())


def test_normalizar_imagem_ja_na_referencia_quase_nao_muda() -> None:
    ref = referencia()
    img = sintetica(HE_REF, semente=1)
    saida = normalizar(img, ref.manchas)
    assert np.abs(saida.astype(int) - img.astype(int)).mean() < 6


def test_imagem_palida_e_recolorida_para_a_referencia() -> None:
    ref = referencia()
    palida = sintetica(HE_REF, escala=0.45, semente=2)
    saida = preparar(palida, ref).normalizada
    alvo = sintetica(HE_REF, semente=2)
    assert abs(float(saida.mean()) - float(alvo.mean())) < abs(float(palida.mean()) - float(alvo.mean())) / 3


def test_coloracao_diferente_e_marcada_pela_classe_sugerida() -> None:
    ref = referencia(limiar=3.0)
    outra = preparar(sintetica(girar(HE_REF, 25), semente=3), ref)
    igual = preparar(sintetica(HE_REF, semente=3), ref)
    assert fora_do_padrao(outra, "NORM", ref)
    assert not fora_do_padrao(igual, "NORM", ref)
    folgada = ReferenciaCor(**{**ref.__dict__, "limiares": {c: [90.0, 90.0] for c in CLASSES}})
    assert not fora_do_padrao(outra, "NORM", folgada)  # classe com variação natural grande não dispara


def test_calcular_referencia_gera_limiar_por_classe() -> None:
    imagens = [(sintetica(HE_REF, semente=i), c) for i, c in enumerate(["NORM", "TUM"] * 6)]
    ref = calcular_referencia(imagens, "teste")
    assert set(ref.limiares) == {"NORM", "TUM"}
    assert ref.n_imagens == 12
    with pytest.raises(ValueError):
        calcular_referencia(imagens[:3], "teste")


def test_referencia_publicada_tem_as_nove_classes() -> None:
    ref = ReferenciaCor.carregar()
    assert set(ref.limiares) == set(CLASSES)
    assert np.allclose(np.linalg.norm(np.array(ref.he), axis=1), 1, atol=1e-3)
