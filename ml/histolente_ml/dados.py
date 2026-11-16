"""Leitura do dataset, divisão estratificada e transformações.

Protocolo (evita vazamento de dados — risco R02):
- treino e validação: NCT-CRC-HE-100K, divisão estratificada por classe com semente fixa;
- teste final: CRC-VAL-HE-7K (pacientes diferentes), usado uma única vez, no fim.
O 100K não identifica o paciente de cada patch; por isso a validação interna tende a ser otimista
e só o resultado no 7K é reportado como desempenho do modelo.
"""
from __future__ import annotations

import csv
import random
from collections import defaultdict
from pathlib import Path

import torch
from PIL import Image
from torch.utils.data import Dataset
from torchvision.transforms import v2 as T

from . import CLASSES

EXTENSOES = {".tif", ".tiff", ".png", ".jpg", ".jpeg"}
MEDIA_IMAGENET = (0.485, 0.456, 0.406)
DESVIO_IMAGENET = (0.229, 0.224, 0.225)
TAMANHO = 224


def listar_imagens(raiz: Path) -> list[tuple[str, str]]:
    """Retorna (caminho relativo à raiz, classe) para cada imagem em raiz/<CLASSE>/*."""
    itens: list[tuple[str, str]] = []
    for classe in CLASSES:
        pasta = raiz / classe
        if not pasta.is_dir():
            raise FileNotFoundError(f"Pasta da classe {classe} não encontrada em {raiz}")
        for arq in sorted(pasta.iterdir()):
            if arq.suffix.lower() in EXTENSOES:
                itens.append((str(arq.relative_to(raiz)), classe))
    return itens


def dividir_estratificado(itens: list[tuple[str, str]], frac_validacao: float, semente: int
                          ) -> tuple[list[tuple[str, str]], list[tuple[str, str]]]:
    """Divide mantendo a proporção de cada classe. Determinístico para a mesma semente."""
    por_classe: dict[str, list[tuple[str, str]]] = defaultdict(list)
    for it in itens:
        por_classe[it[1]].append(it)
    rng = random.Random(semente)
    treino: list[tuple[str, str]] = []
    val: list[tuple[str, str]] = []
    for classe in CLASSES:
        grupo = sorted(por_classe[classe])
        rng.shuffle(grupo)
        n_val = max(1, round(len(grupo) * frac_validacao))
        val += grupo[:n_val]
        treino += grupo[n_val:]
    return treino, val


def salvar_csv(itens: list[tuple[str, str]], destino: Path) -> None:
    destino.parent.mkdir(parents=True, exist_ok=True)
    with destino.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["caminho", "classe"])
        w.writerows(itens)


def ler_csv(origem: Path) -> list[tuple[str, str]]:
    with origem.open(encoding="utf-8") as f:
        return [(l["caminho"], l["classe"]) for l in csv.DictReader(f)]


def transformacao_avaliacao() -> T.Compose:
    """Determinística. É a mesma usada pelo serviço de inferência (contrato de pré-processamento)."""
    return T.Compose([
        T.ToImage(),
        T.Resize((TAMANHO, TAMANHO), antialias=True),
        T.ToDtype(torch.float32, scale=True),
        T.Normalize(MEDIA_IMAGENET, DESVIO_IMAGENET),
    ])


class Rotacao90:
    """Rotação por múltiplos de 90°: não interpola nem distorce a morfologia."""

    def __call__(self, img: torch.Tensor) -> torch.Tensor:
        return torch.rot90(img, k=random.randint(0, 3), dims=(-2, -1))


def transformacao_treino() -> T.Compose:
    """Aumento de dados morfologicamente válido.

    Permitido: espelhamentos, rotações de 90°, variação leve de brilho/contraste/saturação.
    Evitado de propósito: recortes com mudança de escala (alteram o tamanho nuclear), distorções
    elásticas e mudança grande de matiz (descaracteriza a coloração H&E).
    """
    return T.Compose([
        T.ToImage(),
        T.Resize((TAMANHO, TAMANHO), antialias=True),
        T.RandomHorizontalFlip(),
        T.RandomVerticalFlip(),
        Rotacao90(),
        T.ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1, hue=0.02),
        T.ToDtype(torch.float32, scale=True),
        T.Normalize(MEDIA_IMAGENET, DESVIO_IMAGENET),
    ])


class DatasetPatches(Dataset[tuple[torch.Tensor, int]]):
    def __init__(self, raiz: Path, itens: list[tuple[str, str]], transformacao: T.Compose) -> None:
        self.raiz = raiz
        self.itens = itens
        self.transformacao = transformacao
        self.indice = {c: i for i, c in enumerate(CLASSES)}

    def __len__(self) -> int:
        return len(self.itens)

    def __getitem__(self, i: int) -> tuple[torch.Tensor, int]:
        caminho, classe = self.itens[i]
        with Image.open(self.raiz / caminho) as img:
            x = self.transformacao(img.convert("RGB"))
        return x, self.indice[classe]
