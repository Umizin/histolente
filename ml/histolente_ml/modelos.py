"""Backbones CNN candidatos (estratégia: trocar a arquitetura sem mudar o restante do pipeline)."""
from __future__ import annotations

from collections.abc import Callable

import torch
from torch import nn
from torchvision import models

from . import CLASSES

N = len(CLASSES)


def _resnet18(pre: bool) -> nn.Module:
    m = models.resnet18(weights=models.ResNet18_Weights.DEFAULT if pre else None)
    m.fc = nn.Linear(m.fc.in_features, N)
    return m


def _resnet50(pre: bool) -> nn.Module:
    m = models.resnet50(weights=models.ResNet50_Weights.DEFAULT if pre else None)
    m.fc = nn.Linear(m.fc.in_features, N)
    return m


def _efficientnet_b0(pre: bool) -> nn.Module:
    m = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT if pre else None)
    ultima = m.classifier[-1]
    assert isinstance(ultima, nn.Linear)
    m.classifier[-1] = nn.Linear(ultima.in_features, N)
    return m


def _densenet121(pre: bool) -> nn.Module:
    m = models.densenet121(weights=models.DenseNet121_Weights.DEFAULT if pre else None)
    m.classifier = nn.Linear(m.classifier.in_features, N)
    return m


BACKBONES: dict[str, Callable[[bool], nn.Module]] = {
    "resnet18": _resnet18,
    "resnet50": _resnet50,
    "efficientnet_b0": _efficientnet_b0,
    "densenet121": _densenet121,
}


def criar(backbone: str, pretreinado: bool = True) -> nn.Module:
    if backbone not in BACKBONES:
        raise ValueError(f"Backbone desconhecido: {backbone}. Opções: {', '.join(BACKBONES)}")
    return BACKBONES[backbone](pretreinado)


def camada_alvo(modelo: nn.Module, backbone: str) -> tuple[str, nn.Module]:
    """Última camada convolucional com resolução espacial, usada pelo Grad-CAM."""
    if backbone.startswith("resnet"):
        return "layer4", modelo.layer4  # type: ignore[return-value]
    if backbone.startswith("efficientnet"):
        return "features", modelo.features  # type: ignore[return-value]
    if backbone.startswith("densenet"):
        # Não usar `features` inteiro: a DenseNet aplica ReLU in-place na saída de `features`,
        # o que é incompatível com o hook de gradiente. O último bloco denso não sofre isso.
        return "features.denseblock4", modelo.features.denseblock4  # type: ignore[return-value]
    raise ValueError(backbone)


def contar_parametros(modelo: nn.Module) -> int:
    return sum(p.numel() for p in modelo.parameters())


def carregar(caminho_pt: str, backbone: str, dispositivo: str = "cpu") -> nn.Module:
    m = criar(backbone, pretreinado=False)
    estado = torch.load(caminho_pt, map_location=dispositivo, weights_only=True)
    m.load_state_dict(estado)
    return m.eval().to(dispositivo)
