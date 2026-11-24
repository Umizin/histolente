"""Linha de comando do pipeline.

  python -m histolente_ml dividir   --raiz DADOS/NCT-CRC-HE-100K --saida ml/splits
  python -m histolente_ml treinar   --raiz DADOS/NCT-CRC-HE-100K --splits ml/splits --backbone resnet18 --saida runs/r18
  python -m histolente_ml avaliar   --modelo runs/r18/melhor.pt --backbone resnet18 --raiz DADOS/CRC-VAL-HE-7K --saida ml/reports/r18
  python -m histolente_ml exportar  --modelo runs/r18/melhor.pt --backbone resnet18 --versao 0.1.0 --treino runs/r18/treino.json --metricas ml/reports/r18/metricas.json
  python -m histolente_ml latencia  --modelo runs/r18/melhor.pt --backbone resnet18
"""
from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path

import torch

from .dados import dividir_estratificado, ler_csv, listar_imagens, salvar_csv


def main() -> None:
    ap = argparse.ArgumentParser(prog="histolente_ml")
    sub = ap.add_subparsers(dest="cmd", required=True)

    d = sub.add_parser("dividir", help="divide o 100K em treino/validação estratificados")
    d.add_argument("--raiz", required=True)
    d.add_argument("--saida", default="ml/splits")
    d.add_argument("--frac-val", type=float, default=0.15)
    d.add_argument("--semente", type=int, default=42)
    d.add_argument("--max-por-classe", type=int, default=None, help="subamostra para treino preliminar em CPU")

    t = sub.add_parser("treinar")
    t.add_argument("--raiz", required=True)
    t.add_argument("--splits", default="ml/splits")
    t.add_argument("--saida", required=True)
    t.add_argument("--backbone", default="resnet18")
    t.add_argument("--sem-pretreino", action="store_true")
    t.add_argument("--epocas", type=int, default=10)
    t.add_argument("--lote", type=int, default=64)
    t.add_argument("--lr", type=float, default=3e-4)
    t.add_argument("--paciencia", type=int, default=3)
    t.add_argument("--workers", type=int, default=4)
    t.add_argument("--semente", type=int, default=42)

    a = sub.add_parser("avaliar", help="avalia no conjunto de teste independente (CRC-VAL-HE-7K)")
    a.add_argument("--modelo", required=True)
    a.add_argument("--backbone", required=True)
    a.add_argument("--raiz", required=True)
    a.add_argument("--saida", required=True)
    a.add_argument("--bootstrap", type=int, default=1000)
    a.add_argument("--workers", type=int, default=4)

    e = sub.add_parser("exportar")
    e.add_argument("--modelo", required=True)
    e.add_argument("--backbone", required=True)
    e.add_argument("--nome", default=None)
    e.add_argument("--versao", required=True)
    e.add_argument("--treino", default=None)
    e.add_argument("--metricas", default=None)
    e.add_argument("--destino", default="ml/models")

    l = sub.add_parser("latencia")
    l.add_argument("--modelo", default=None, help="sem modelo, mede com pesos aleatórios")
    l.add_argument("--backbone", default="resnet18")
    l.add_argument("--dispositivo", default="cpu")
    l.add_argument("--repeticoes", type=int, default=50)
    l.add_argument("--threads", type=int, default=None)

    args = ap.parse_args()
    disp = "cuda" if torch.cuda.is_available() else "cpu"

    if args.cmd == "dividir":
        itens = listar_imagens(Path(args.raiz))
        tr, val = dividir_estratificado(itens, args.frac_val, args.semente, args.max_por_classe)
        salvar_csv(tr, Path(args.saida) / "treino.csv")
        salvar_csv(val, Path(args.saida) / "validacao.csv")
        print(json.dumps({"treino": dict(Counter(c for _, c in tr)), "validacao": dict(Counter(c for _, c in val))}, indent=2))

    elif args.cmd == "treinar":
        from .treino import ConfigTreino, treinar
        treinar(ConfigTreino(raiz_dados=args.raiz, csv_treino=f"{args.splits}/treino.csv", csv_val=f"{args.splits}/validacao.csv",
                             saida=args.saida, backbone=args.backbone, pretreinado=not args.sem_pretreino, epocas=args.epocas,
                             lote=args.lote, taxa_aprendizado=args.lr, paciencia=args.paciencia, semente=args.semente,
                             workers=args.workers))

    elif args.cmd == "avaliar":
        from .avaliacao import avaliar
        from .modelos import carregar
        m = carregar(args.modelo, args.backbone, disp)
        res = avaliar(m, Path(args.raiz), listar_imagens(Path(args.raiz)), Path(args.saida), disp, args.bootstrap, args.workers)
        print(json.dumps({k: res[k] for k in ("n", "accuracy", "f1_macro", "roc_auc_ovr_macro", "ece", "ic95_bootstrap", "sensibilidade_TUM")}, indent=2))

    elif args.cmd == "exportar":
        from .exportar import exportar
        card = exportar(Path(args.modelo), Path(args.destino), args.nome or f"{args.backbone}-nct", args.versao, args.backbone,
                        Path(args.treino) if args.treino else None, Path(args.metricas) if args.metricas else None)
        print(json.dumps({k: card[k] for k in ("arquivo", "sha256")}, indent=2))

    elif args.cmd == "latencia":
        from .latencia import medir
        from .modelos import carregar, criar
        m = carregar(args.modelo, args.backbone, args.dispositivo) if args.modelo else criar(args.backbone, pretreinado=False)
        print(json.dumps(medir(m, args.backbone, args.dispositivo, args.repeticoes, threads=args.threads), indent=2))


if __name__ == "__main__":
    main()
