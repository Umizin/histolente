"""Testes do contrato de mensagens (EN03, RNF06).

Rodar: pip install -r packages/contracts/requirements-dev.txt && pytest packages/contracts
"""
from __future__ import annotations

import copy
import json
from pathlib import Path
from typing import Any

import pytest
from jsonschema import Draft202012Validator, FormatChecker

BASE = Path(__file__).resolve().parent.parent
CLASSES = ["ADI", "BACK", "DEB", "LYM", "MUC", "MUS", "NORM", "STR", "TUM"]


def carregar(nome: str) -> Any:
    return json.loads((BASE / nome).read_text(encoding="utf-8"))


def validador(schema: str) -> Draft202012Validator:
    s = carregar(schema)
    Draft202012Validator.check_schema(s)
    return Draft202012Validator(s, format_checker=FormatChecker())


REQ = validador("inference.request.schema.json")
DONE = validador("inference.completed.schema.json")


def erros(v: Draft202012Validator, doc: Any) -> list[str]:
    return [e.message for e in v.iter_errors(doc)]


def soma_ok(msg: dict[str, Any]) -> bool:
    """Regra que o JSON Schema não expressa: probabilidades somam 1 ± 1e-4."""
    return abs(sum(msg["probabilities"].values()) - 1.0) <= 1e-4


# ----------------------------------------------------------------- exemplos válidos
def test_exemplo_request_valido() -> None:
    assert erros(REQ, carregar("exemplos/request.json")) == []


def test_exemplo_completed_done_valido() -> None:
    msg = carregar("exemplos/completed-done.json")
    assert erros(DONE, msg) == []
    assert soma_ok(msg)


def test_exemplo_completed_failed_valido() -> None:
    assert erros(DONE, carregar("exemplos/completed-failed.json")) == []


# ----------------------------------------------------------------- request inválido
@pytest.mark.parametrize(
    "campo,valor",
    [
        ("mime_type", "image/gif"),          # RN01: só PNG/JPEG
        ("image_sha256", "ABC"),             # hash fora do formato
        ("job_id", "nao-e-uuid"),
        ("schema_version", "2.0"),
        ("target_class", "XYZ"),             # fora das 9 classes
    ],
)
def test_request_rejeita_campos_invalidos(campo: str, valor: Any) -> None:
    msg = carregar("exemplos/request.json")
    msg[campo] = valor
    assert erros(REQ, msg)


def test_request_nao_aceita_campos_extras() -> None:
    msg = carregar("exemplos/request.json")
    msg["database_url"] = "postgres://..."  # o serviço de inferência não recebe nada de banco (RNF06)
    assert erros(REQ, msg)


# ----------------------------------------------------------------- completed inválido
def test_done_exige_resultado() -> None:
    msg = carregar("exemplos/completed-done.json")
    del msg["probabilities"]
    assert erros(DONE, msg)


def test_done_exige_as_nove_classes() -> None:
    msg = carregar("exemplos/completed-done.json")
    del msg["probabilities"]["BACK"]
    assert erros(DONE, msg)


def test_done_nao_aceita_classe_desconhecida() -> None:
    msg = carregar("exemplos/completed-done.json")
    msg["probabilities"]["XYZ"] = 0.0
    assert erros(DONE, msg)


def test_done_nao_aceita_erro_preenchido() -> None:
    msg = carregar("exemplos/completed-done.json")
    msg["error"] = "algo"
    assert erros(DONE, msg)


def test_failed_exige_mensagem_de_erro() -> None:
    msg = carregar("exemplos/completed-failed.json")
    msg["error"] = ""
    assert erros(DONE, msg)


def test_gradcam_deve_ter_224x224() -> None:
    msg = carregar("exemplos/completed-done.json")
    msg["gradcam"]["resolution"] = [7, 7]
    assert erros(DONE, msg)


def test_probabilidade_fora_de_0_1() -> None:
    msg = carregar("exemplos/completed-done.json")
    msg["probabilities"]["TUM"] = 1.2
    assert erros(DONE, msg)


def test_soma_das_probabilidades_e_verificada() -> None:
    msg = copy.deepcopy(carregar("exemplos/completed-done.json"))
    msg["probabilities"]["TUM"] = 0.5
    assert erros(DONE, msg) == []   # o schema aceita...
    assert not soma_ok(msg)         # ...mas a regra de soma rejeita


def test_ordem_canonica_das_classes() -> None:
    """A ordem do enum deve ser a do ImageFolder (alfabética) — mudar quebra o histórico."""
    enum = carregar("inference.completed.schema.json")["$defs"]["tissue_class"]["enum"]
    assert enum == CLASSES == sorted(CLASSES)


# ----------------------------------------------------------------- campos opcionais de cor (25/11/2026)
def test_campos_de_cor_sao_opcionais() -> None:
    msg = carregar("exemplos/completed-done.json")
    del msg["ood_reasons"], msg["color_adjusted"]
    assert erros(DONE, msg) == []


def test_motivo_desconhecido_e_rejeitado() -> None:
    msg = carregar("exemplos/completed-done.json")
    msg["ood_reasons"] = ["coloracao", "outro"]
    assert erros(DONE, msg)


def test_cor_ajustada_traz_classe_e_probabilidade() -> None:
    msg = carregar("exemplos/completed-done.json")
    msg["ood_reasons"] = ["coloracao"]
    msg["color_adjusted"] = {"predicted_class": "TUM", "probability": 0.775}
    assert erros(DONE, msg) == []
    msg["color_adjusted"] = {"predicted_class": "XYZ", "probability": 0.775}
    assert erros(DONE, msg)
