"""Coloração H&E: normalização de Macenko e verificação de coloração fora do padrão (RF17, risco R01).

O NCT-CRC-HE-100K foi todo normalizado pelo método de Macenko (Kather et al., 2018). Uma imagem de outro
laboratório ou de um atlas chega com outra coloração e o modelo pode errar com confiança alta. Aqui:

- `estimar_manchas` acha os vetores de hematoxilina e eosina da imagem (Macenko et al., 2009);
- `normalizar` leva a imagem para a coloração de referência do treino;
- `coloracao_fora_do_padrao` decide o alerta de coloração. A versão normalizada NÃO substitui o resultado: no
  CRC-VAL-HE-7K, trocar o resultado pela versão normalizada piorou o modelo (ADR 0005). Ela aparece só como
  informação adicional ("com a cor ajustada, a sugestão seria...");
- `fora_do_padrao` compara o ângulo entre os vetores da imagem e os da referência com o limiar da classe
  sugerida. O limiar é por classe porque a variação natural difere muito: em epitélio (NORM, TUM) os vetores
  quase não variam no treino, enquanto em fundo, detritos e músculo a estimativa oscila bastante.

A referência (vetores, concentrações e limiares) é calculada a partir das imagens de treino pelo comando
`python -m histolente_ml referencia-cor` e fica em `referencia_cor.json`, ao lado deste módulo.
"""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path

import numpy as np

ARQUIVO_REFERENCIA = Path(__file__).with_name("referencia_cor.json")
LUZ = 255.0
BETA = 0.15  # densidade óptica mínima para um pixel contar como tecido corado
ALFA = 1.0  # percentil dos ângulos extremos (robustez a ruído)
MIN_PIXELS = 2000  # menos que isso (fundo, gordura) não dá para estimar a coloração com segurança


@dataclass
class Manchas:
    he: np.ndarray  # 2×3: linha 0 = hematoxilina, linha 1 = eosina (vetores unitários em densidade óptica)
    max_c: np.ndarray  # 2: percentil 99 das concentrações de cada corante


@dataclass
class ReferenciaCor:
    he: list[list[float]]
    max_c: list[float]
    limiares: dict[str, list[float]]  # classe -> [ângulo H, ângulo E] máximos, em graus
    n_imagens: int
    origem: str

    @property
    def manchas(self) -> Manchas:
        return Manchas(np.array(self.he, dtype=np.float64), np.array(self.max_c, dtype=np.float64))

    def salvar(self, destino: Path = ARQUIVO_REFERENCIA) -> None:
        destino.write_text(json.dumps(asdict(self), indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    @classmethod
    def carregar(cls, origem: Path = ARQUIVO_REFERENCIA) -> "ReferenciaCor":
        return cls(**json.loads(origem.read_text(encoding="utf-8")))


def densidade_optica(rgb: np.ndarray) -> np.ndarray:
    return -np.log((rgb.astype(np.float64) + 1.0) / (LUZ + 1.0))


def estimar_manchas(rgb: np.ndarray) -> Manchas | None:
    """Macenko et al. (2009). Retorna None quando há pouco tecido corado para estimar."""
    od = densidade_optica(rgb).reshape(-1, 3)
    tecido = od[(od > BETA).all(axis=1)]
    if len(tecido) < MIN_PIXELS:
        return None
    _, vetores = np.linalg.eigh(np.cov(tecido.T))
    plano = vetores[:, [1, 2]]  # dois maiores autovalores
    proj = tecido @ plano
    angulos = np.arctan2(proj[:, 1], proj[:, 0])
    mn, mx = np.percentile(angulos, ALFA), np.percentile(angulos, 100 - ALFA)
    v1 = plano @ np.array([np.cos(mn), np.sin(mn)])
    v2 = plano @ np.array([np.cos(mx), np.sin(mx)])
    v1, v2 = v1 * np.sign(v1.sum()), v2 * np.sign(v2.sum())  # densidade óptica é positiva
    # hematoxilina absorve mais no vermelho (componente R maior em densidade óptica)
    he = np.array([v1, v2]) if v1[0] > v2[0] else np.array([v2, v1])
    he /= np.linalg.norm(he, axis=1, keepdims=True)
    conc = np.linalg.lstsq(he.T, od.T, rcond=None)[0]
    max_c = np.percentile(conc, 99, axis=1)
    if not np.all(np.isfinite(he)) or np.any(max_c <= 0):
        return None
    return Manchas(he, max_c)


def angulos(m: Manchas, ref: Manchas) -> tuple[float, float]:
    """Ângulo, em graus, entre os vetores de H e de E da imagem e os da referência."""
    cos = np.clip((m.he * ref.he).sum(axis=1), -1.0, 1.0)
    h, e = np.degrees(np.arccos(cos))
    return float(h), float(e)


def normalizar(rgb: np.ndarray, ref: Manchas, m: Manchas | None = None) -> np.ndarray:
    """Recolore a imagem com os vetores e as concentrações máximas da referência."""
    m = m or estimar_manchas(rgb)
    if m is None:
        return rgb
    od = densidade_optica(rgb).reshape(-1, 3)
    conc = np.linalg.lstsq(m.he.T, od.T, rcond=None)[0]
    conc *= (ref.max_c / m.max_c)[:, None]
    saida = (LUZ + 1.0) * np.exp(-(ref.he.T @ conc)) - 1.0
    return np.clip(saida.T.reshape(rgb.shape), 0, 255).astype(np.uint8)


@dataclass
class ResultadoCor:
    normalizada: np.ndarray
    estimada: bool  # False quando havia pouco tecido e a imagem seguiu sem normalização
    angulo_h: float | None
    angulo_e: float | None


def preparar(rgb: np.ndarray, ref: ReferenciaCor) -> ResultadoCor:
    """Estima a coloração uma vez e usa a estimativa para medir o desvio e para normalizar."""
    m = estimar_manchas(rgb)
    if m is None:
        return ResultadoCor(rgb, False, None, None)
    h, e = angulos(m, ref.manchas)
    return ResultadoCor(normalizar(rgb, ref.manchas, m), True, h, e)


def fora_do_padrao(r: ResultadoCor, classe: str, ref: ReferenciaCor) -> bool:
    """Coloração além do que o treino mostrou para a classe sugerida."""
    if not r.estimada or classe not in ref.limiares or r.angulo_h is None or r.angulo_e is None:
        return False
    lh, le = ref.limiares[classe]
    return r.angulo_h > lh or r.angulo_e > le


def coloracao_fora_do_padrao(r: ResultadoCor, classe_original: str, classe_normalizada: str, ref: ReferenciaCor) -> bool:
    """A coloração está fora do padrão da classe sugerida para a imagem original ou para a normalizada.
    As duas são consultadas porque a cor errada pode levar a original para uma classe de variação larga (ex.: BACK)."""
    return fora_do_padrao(r, classe_original, ref) or fora_do_padrao(r, classe_normalizada, ref)


def calcular_referencia(imagens: list[tuple[np.ndarray, str]], origem: str, percentil: float = 99.5) -> ReferenciaCor:
    """Referência = mediana dos vetores e das concentrações das imagens de treino; limiar de cada classe =
    percentil dos ângulos das imagens de treino daquela classe até a referência."""
    est = [(m, c) for m, c in ((estimar_manchas(a), c) for a, c in imagens) if m is not None]
    if len(est) < 10:
        raise ValueError("imagens com tecido insuficientes para calcular a referência de cor")
    he = np.median(np.stack([m.he for m, _ in est]), axis=0)
    he /= np.linalg.norm(he, axis=1, keepdims=True)
    max_c = np.median(np.stack([m.max_c for m, _ in est]), axis=0)
    ref = Manchas(he, max_c)
    limiares: dict[str, list[float]] = {}
    for classe in sorted({c for _, c in est}):
        ang = np.array([angulos(m, ref) for m, c in est if c == classe])
        limiares[classe] = [round(float(np.percentile(ang[:, i], percentil)), 3) for i in (0, 1)]
    return ReferenciaCor(
        he=[[round(float(v), 6) for v in linha] for linha in he],
        max_c=[round(float(v), 6) for v in max_c],
        limiares=limiares,
        n_imagens=len(est),
        origem=origem,
    )

class NormalizacaoCor:
    """Passo de pré-processamento (PIL → PIL) para o DataLoader da avaliação."""

    def __init__(self, ref: ReferenciaCor | None = None) -> None:
        self.ref = ref or ReferenciaCor.carregar()

    def __call__(self, img: "Image.Image") -> "Image.Image":
        from PIL import Image
        return Image.fromarray(preparar(np.asarray(img.convert("RGB")), self.ref).normalizada)
