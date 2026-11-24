"""Carregamento do modelo, classificação, Grad-CAM e detecção preliminar de imagem fora do padrão.

O pré-processamento e o Grad-CAM vêm do pacote `histolente_ml` (o mesmo do treino), o que garante que o
serviço trata a imagem exatamente como no treino.
"""
from __future__ import annotations

import base64
import io
import json
import time
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import torch
from PIL import Image

from histolente_ml import CLASSES
from histolente_ml.dados import TAMANHO, transformacao_avaliacao
from histolente_ml.exportar import sha256_arquivo
from histolente_ml.gradcam import GradCAM
from histolente_ml.modelos import camada_alvo, carregar, criar

LIMIAR_TECIDO = 0.15  # fração mínima de pixels com tecido (não claros) para não marcar como fora do padrão
LIMIAR_MSP = 0.50  # probabilidade máxima abaixo disso também marca a imagem (linha de base; RF17 preliminar)


@dataclass
class InfoModelo:
    nome: str
    versao: str
    sha256: str
    backbone: str
    camada: str
    preliminar: bool


class Classificador:
    def __init__(self, pasta: str) -> None:
        self.info, self.modelo = self._carregar(Path(pasta))
        nome_camada, camada = camada_alvo(self.modelo, self.info.backbone)
        self.info.camada = nome_camada
        self.cam = GradCAM(self.modelo, camada)
        self.tf = transformacao_avaliacao()
        self._aquecer()

    @staticmethod
    def _carregar(pasta: Path) -> tuple[InfoModelo, torch.nn.Module]:
        cards = sorted(pasta.glob("*.model_card.json")) if pasta.is_dir() else []
        if cards:
            card = json.loads(cards[-1].read_text(encoding="utf-8"))
            pt = pasta / card["arquivo"]
            if sha256_arquivo(pt) != card["sha256"]:
                raise RuntimeError(f"SHA-256 de {pt.name} não confere com o model card")
            info = InfoModelo(card["nome"], card["versao"], card["sha256"], card["backbone"], "", False)
            return info, carregar(str(pt), card["backbone"])
        # Sem modelo treinado: pesos aleatórios só para demonstrar o fluxo (nunca usar para estudo)
        torch.manual_seed(0)
        m = criar("resnet18", pretreinado=False).eval()
        return InfoModelo("resnet18-aleatorio", "0.0.0", "0" * 64, "resnet18", "", True), m

    def _aquecer(self) -> None:
        self.cam(torch.zeros(1, 3, TAMANHO, TAMANHO))

    @staticmethod
    def recorte_central(img: Image.Image) -> Image.Image:
        """RN01: imagens maiores que 224×224 viram recorte central, sem reduzir a escala."""
        w, h = img.size
        if w < TAMANHO or h < TAMANHO:
            raise ValueError(f"imagem menor que {TAMANHO}×{TAMANHO} px")
        x, y = (w - TAMANHO) // 2, (h - TAMANHO) // 2
        return img.crop((x, y, x + TAMANHO, y + TAMANHO))

    @staticmethod
    def fracao_tecido(img: Image.Image) -> float:
        arr = np.asarray(img.convert("L"), dtype=np.float32)
        return float((arr < 220).mean())

    def analisar(self, png_ou_jpeg: bytes, classe_alvo: str | None = None) -> dict[str, object]:
        t0 = time.perf_counter()
        img = self.recorte_central(Image.open(io.BytesIO(png_ou_jpeg)).convert("RGB"))
        x = self.tf(img).unsqueeze(0)
        t1 = time.perf_counter()
        alvo = CLASSES.index(classe_alvo) if classe_alvo else None
        mapa, probs = self.cam(x, alvo)  # uma passagem: classificação + Grad-CAM
        t2 = time.perf_counter()
        p = probs.numpy().astype(float)
        p = p / p.sum()
        predita = CLASSES[int(p.argmax())]
        ood = self.fracao_tecido(img) < LIMIAR_TECIDO or float(p.max()) < LIMIAR_MSP
        buf = io.BytesIO()
        Image.fromarray((mapa.numpy() * 255).astype(np.uint8), mode="L").save(buf, format="PNG")
        t3 = time.perf_counter()
        return {
            "predicted_class": predita,
            "probabilities": {c: round(float(v), 6) for c, v in zip(CLASSES, p)},
            "out_of_distribution": bool(ood),
            "gradcam": {
                "target_layer": self.info.camada,
                "target_class": classe_alvo or predita,
                "heatmap_png_b64": base64.b64encode(buf.getvalue()).decode(),
                "colormap": "gray",
                "resolution": [TAMANHO, TAMANHO],
            },
            "timings_ms": {
                "preprocess": round((t1 - t0) * 1000, 2),
                "inference": round((t2 - t1) * 1000, 2),
                "gradcam": round((t3 - t2) * 1000, 2),
                "total_worker": round((t3 - t0) * 1000, 2),
            },
        }
