"""Testes do serviço de inferência (EN04): contrato, pré-processamento, Grad-CAM e RNF06."""
from __future__ import annotations

import base64
import io
import json
import re
from pathlib import Path

import numpy as np
import pytest
from jsonschema import Draft202012Validator, FormatChecker
from PIL import Image

from app.modelo import Classificador

RAIZ = Path(__file__).resolve().parents[3]
SCHEMA = json.loads((RAIZ / "packages/contracts/inference.completed.schema.json").read_text(encoding="utf-8"))


def _png(w: int, h: int, cor: tuple[int, int, int] = (200, 120, 180)) -> bytes:
    arr = np.full((h, w, 3), cor, dtype=np.uint8)
    arr[::7, ::5] = (60, 30, 120)  # "núcleos" para ter tecido
    buf = io.BytesIO()
    Image.fromarray(arr).save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture(scope="module")
def clf(tmp_path_factory: pytest.TempPathFactory) -> Classificador:
    return Classificador(str(tmp_path_factory.mktemp("sem_modelo")))  # pesos aleatórios


def test_sem_modelo_usa_pesos_aleatorios_marcados(clf: Classificador) -> None:
    assert clf.info.preliminar and clf.info.versao == "0.0.0"


def test_resultado_respeita_o_contrato(clf: Classificador) -> None:
    r = clf.analisar(_png(224, 224))
    msg = {"schema_version": "1.0", "job_id": "6b2f6a1e-0c1f-4d7a-9a51-3f3b0c9b7c11",
           "analysis_id": "f0b7a1d2-63c4-4e8f-8d6b-2a9a4c1e5d33", "status": "DONE",
           "model": {"name": clf.info.nome, "version": clf.info.versao, "sha256": clf.info.sha256},
           "completed_at": "2026-11-24T10:00:00Z", "correlation_id": "0d3c1f8e-6c2b-4b5a-a1f3-9e8d7c6b5a40",
           "error": None, **r}
    erros = [e.message for e in Draft202012Validator(SCHEMA, format_checker=FormatChecker()).iter_errors(msg)]
    assert erros == []
    assert abs(sum(r["probabilities"].values()) - 1) <= 1e-4  # type: ignore[union-attr]


def test_gradcam_224_em_escala_de_cinza(clf: Classificador) -> None:
    r = clf.analisar(_png(224, 224))
    img = Image.open(io.BytesIO(base64.b64decode(r["gradcam"]["heatmap_png_b64"])))  # type: ignore[index]
    assert img.size == (224, 224) and img.mode == "L"


def test_recorte_central_sem_reducao_de_escala(clf: Classificador) -> None:
    img = Image.new("RGB", (500, 300))
    img.paste((255, 0, 0), (138, 38, 362, 262))  # quadrado central de 224
    rec = Classificador.recorte_central(img)
    assert rec.size == (224, 224) and np.asarray(rec)[..., 0].min() == 255


def test_imagem_menor_que_224_e_recusada(clf: Classificador) -> None:
    with pytest.raises(ValueError):
        clf.analisar(_png(100, 100))


def test_imagem_sem_tecido_marcada_fora_do_padrao(clf: Classificador) -> None:
    branca = io.BytesIO()
    Image.new("RGB", (224, 224), (250, 250, 250)).save(branca, format="PNG")
    assert clf.analisar(branca.getvalue())["out_of_distribution"] is True


def test_rnf06_servico_nao_conhece_banco() -> None:
    """Teste de arquitetura: nenhum driver nem variável de banco no código ou nas dependências."""
    proibido = re.compile(r"psycopg|asyncpg|sqlalchemy|DATABASE_URL|POSTGRES_", re.I)
    base = Path(__file__).resolve().parents[1]
    for arq in [*base.glob("app/*.py"), base / "requirements.txt", base / "Dockerfile"]:
        assert not proibido.search(arq.read_text(encoding="utf-8")), arq.name


def test_mensagem_fora_do_contrato_e_reconhecida() -> None:
    from app.consumidor import mensagem_valida
    assert not mensagem_valida({"job_id": "x"})                      # sem analysis_id: iria travar o consumidor
    assert not mensagem_valida(None)
    assert not mensagem_valida({"schema_version": "1.0", "job_id": "a", "analysis_id": "b", "image_b64": 3})
    assert mensagem_valida({"schema_version": "1.0", "job_id": "a", "analysis_id": "b", "image_b64": "AA=="})
