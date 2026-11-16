"""Exporta o modelo para o serviço de inferência: .pt (state_dict) + model_card.json."""
from __future__ import annotations

import hashlib
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

from . import CLASSES, NOMES_PT


def sha256_arquivo(caminho: Path) -> str:
    h = hashlib.sha256()
    with caminho.open("rb") as f:
        for bloco in iter(lambda: f.read(1 << 20), b""):
            h.update(bloco)
    return h.hexdigest()


def exportar(pt_origem: Path, destino: Path, nome: str, versao: str, backbone: str,
             treino_json: Path | None, metricas_json: Path | None) -> dict[str, object]:
    destino.mkdir(parents=True, exist_ok=True)
    pt = destino / f"{nome}-{versao}.pt"
    shutil.copyfile(pt_origem, pt)
    treino = json.loads(treino_json.read_text(encoding="utf-8")) if treino_json else None
    metr = json.loads(metricas_json.read_text(encoding="utf-8")) if metricas_json else None
    card = {
        "nome": nome,
        "versao": versao,
        "arquivo": pt.name,
        "sha256": sha256_arquivo(pt),
        "backbone": backbone,
        "classes": list(CLASSES),
        "nomes_pt": NOMES_PT,
        "entrada": {"tamanho": [224, 224], "normalizacao": "ImageNet (média 0.485/0.456/0.406, desvio 0.229/0.224/0.225)"},
        "gerado_em": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "dados": {
            "treino_validacao": "NCT-CRC-HE-100K (Kather et al., 2018) — patches normalizados por Macenko",
            "teste": "CRC-VAL-HE-7K (pacientes diferentes do conjunto de treino)",
        },
        "treino": {k: treino[k] for k in ("n_treino", "n_val", "melhor_acc_val", "epocas_executadas", "versoes")} if treino else None,
        "metricas_teste": {k: metr[k] for k in ("n", "accuracy", "balanced_accuracy", "f1_macro", "roc_auc_ovr_macro",
                                                 "ece", "ic95_bootstrap", "sensibilidade_TUM", "confusao_NORM_TUM")} if metr else None,
        "uso_pretendido": "Apoio pedagógico e à triagem. Não emite diagnóstico (Res. CFM nº 2.454/2026).",
        "limitacoes": [
            "Treinado com lâminas de um único centro; imagens de outros laboratórios, colorações ou fotos de celular podem ter desempenho pior.",
            "Classifica apenas 9 tipos de tecido colorretal em patches de 224×224 px.",
            "O Grad-CAM indica regiões de influência na decisão, não a localização de lesões.",
        ],
    }
    (destino / f"{nome}-{versao}.model_card.json").write_text(json.dumps(card, indent=2, ensure_ascii=False), encoding="utf-8")
    return card
