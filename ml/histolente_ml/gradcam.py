"""Grad-CAM (Selvaraju et al., 2017).

mapa = ReLU( Σ_k α_k · A^k ),  α_k = média espacial de ∂y_c/∂A^k
onde A^k são os mapas de ativação da camada-alvo e y_c é o logit (antes do softmax) da classe c.
"""
from __future__ import annotations

import torch
import torch.nn.functional as F
from torch import nn


class GradCAM:
    def __init__(self, modelo: nn.Module, camada: nn.Module) -> None:
        self.modelo = modelo.eval()
        self._ativ: torch.Tensor | None = None
        self._grad: torch.Tensor | None = None
        self._h1 = camada.register_forward_hook(self._guardar_ativacao)
        self._h2 = camada.register_full_backward_hook(self._guardar_gradiente)

    def _guardar_ativacao(self, _m: nn.Module, _i: object, saida: torch.Tensor) -> None:
        self._ativ = saida.detach()

    def _guardar_gradiente(self, _m: nn.Module, _gi: object, go: tuple[torch.Tensor, ...]) -> None:
        self._grad = go[0].detach()

    def remover(self) -> None:
        self._h1.remove()
        self._h2.remove()

    def __call__(self, x: torch.Tensor, classe: int | None = None) -> tuple[torch.Tensor, torch.Tensor]:
        """x: tensor 1×3×H×W já normalizado. Retorna (mapa H×W em [0,1], probabilidades 9)."""
        if x.dim() != 4 or x.size(0) != 1:
            raise ValueError("Grad-CAM espera um único patch (1×3×H×W).")
        x = x.clone().requires_grad_(True)
        self.modelo.zero_grad(set_to_none=True)
        with torch.enable_grad():
            logits = self.modelo(x)
            alvo = int(logits.argmax(1)) if classe is None else classe
            logits[0, alvo].backward()
        assert self._ativ is not None and self._grad is not None
        pesos = self._grad.mean(dim=(2, 3), keepdim=True)
        mapa = F.relu((pesos * self._ativ).sum(1, keepdim=True))
        mapa = F.interpolate(mapa, size=x.shape[-2:], mode="bilinear", align_corners=False)[0, 0]
        mn, mx = mapa.min(), mapa.max()
        mapa = (mapa - mn) / (mx - mn) if (mx - mn) > 1e-8 else torch.zeros_like(mapa)  # mapa constante (ex.: BACK)
        return mapa.detach(), torch.softmax(logits.detach(), 1)[0]
