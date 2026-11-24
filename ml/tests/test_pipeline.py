"""Testes do pipeline de ML (EN01) com um conjunto sintético pequeno.

Os números obtidos aqui NÃO são desempenho do modelo: servem só para verificar que o código funciona.
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import pytest
import torch
from PIL import Image

from histolente_ml import CLASSES
from histolente_ml.avaliacao import avaliar, ece, metricas
from histolente_ml.dados import (
    DatasetPatches,
    dividir_estratificado,
    ler_csv,
    listar_imagens,
    salvar_csv,
    transformacao_avaliacao,
    transformacao_treino,
)
from histolente_ml.exportar import exportar, sha256_arquivo
from histolente_ml.gradcam import GradCAM
from histolente_ml.latencia import medir
from histolente_ml.modelos import BACKBONES, camada_alvo, carregar, criar
from histolente_ml.treino import ConfigTreino, treinar

POR_CLASSE = 6


@pytest.fixture(scope="session")
def dataset(tmp_path_factory: pytest.TempPathFactory) -> Path:
    """9 pastas (uma por classe) com imagens .tif de cores diferentes."""
    raiz = tmp_path_factory.mktemp("nct")
    rng = np.random.default_rng(0)
    for k, c in enumerate(CLASSES):
        (raiz / c).mkdir()
        base = np.array([30 + 25 * k, 200 - 15 * k, 120 + (k % 3) * 40], dtype=float)
        for i in range(POR_CLASSE):
            arr = np.clip(base + rng.normal(0, 10, (48, 48, 3)), 0, 255).astype("uint8")
            Image.fromarray(arr).save(raiz / c / f"{c}-{i:03d}.tif")
    return raiz


@pytest.fixture(scope="session")
def treinado(dataset: Path, tmp_path_factory: pytest.TempPathFactory) -> tuple[Path, Path]:
    saida = tmp_path_factory.mktemp("run")
    tr, val = dividir_estratificado(listar_imagens(dataset), 0.34, 42)
    salvar_csv(tr, saida / "treino.csv")
    salvar_csv(val, saida / "validacao.csv")
    treinar(ConfigTreino(raiz_dados=str(dataset), csv_treino=str(saida / "treino.csv"), csv_val=str(saida / "validacao.csv"),
                         saida=str(saida), backbone="resnet18", pretreinado=False, epocas=2, lote=8, workers=0, paciencia=5))
    return dataset, saida


# ----------------------------------------------------------------- classes e dados
def test_ordem_canonica() -> None:
    assert list(CLASSES) == sorted(CLASSES) and len(CLASSES) == 9


def test_listar_e_dividir_estratificado(dataset: Path) -> None:
    itens = listar_imagens(dataset)
    assert len(itens) == 9 * POR_CLASSE
    tr, val = dividir_estratificado(itens, 0.34, 42)
    assert set(tr).isdisjoint(val)                        # sem vazamento entre treino e validação
    assert len(tr) + len(val) == len(itens)
    assert {c for _, c in val} == set(CLASSES)            # todas as classes na validação
    assert dividir_estratificado(itens, 0.34, 42) == (tr, val)   # determinístico
    assert dividir_estratificado(itens, 0.34, 7) != (tr, val)


def test_csv_ida_e_volta(dataset: Path, tmp_path: Path) -> None:
    itens = listar_imagens(dataset)
    salvar_csv(itens, tmp_path / "x.csv")
    assert ler_csv(tmp_path / "x.csv") == itens


def test_pasta_de_classe_faltando(tmp_path: Path) -> None:
    (tmp_path / "ADI").mkdir()
    with pytest.raises(FileNotFoundError):
        listar_imagens(tmp_path)


def test_transformacoes(dataset: Path) -> None:
    img = Image.open(next((dataset / "TUM").iterdir())).convert("RGB")
    a, b = transformacao_avaliacao()(img), transformacao_avaliacao()(img)
    assert a.shape == (3, 224, 224) and torch.equal(a, b)  # avaliação é determinística
    assert transformacao_treino()(img).shape == (3, 224, 224)


def test_dataset_rotulos(dataset: Path) -> None:
    ds = DatasetPatches(dataset, listar_imagens(dataset), transformacao_avaliacao())
    x, y = ds[len(ds) - 1]
    assert x.shape == (3, 224, 224) and CLASSES[y] == "TUM"


# ----------------------------------------------------------------- modelos
@pytest.mark.parametrize("backbone", list(BACKBONES))
def test_backbones_tem_9_saidas(backbone: str) -> None:
    m = criar(backbone, pretreinado=False).eval()
    with torch.inference_mode():
        assert m(torch.zeros(1, 3, 224, 224)).shape == (1, 9)
    camada_alvo(m, backbone)


def test_backbone_desconhecido() -> None:
    with pytest.raises(ValueError):
        criar("vgg99", pretreinado=False)


# ----------------------------------------------------------------- treino e avaliação
def test_treino_gera_checkpoint_e_historico(treinado: tuple[Path, Path]) -> None:
    _, saida = treinado
    assert (saida / "melhor.pt").exists()
    resumo = json.loads((saida / "treino.json").read_text(encoding="utf-8"))
    assert resumo["epocas_executadas"] == 2 and resumo["classes"] == list(CLASSES)
    assert {"perda_treino", "acc_val"} <= set(resumo["historico"][0])


def test_avaliacao_no_conjunto_de_teste(treinado: tuple[Path, Path], tmp_path: Path) -> None:
    dados, saida = treinado
    m = carregar(str(saida / "melhor.pt"), "resnet18")
    res = avaliar(m, dados, listar_imagens(dados), tmp_path, "cpu", n_bootstrap=50, workers=0)
    cm = np.array(res["matriz_confusao"])
    assert cm.shape == (9, 9) and cm.sum() == res["n"] == 9 * POR_CLASSE
    for chave in ("accuracy", "f1_macro", "balanced_accuracy", "ece", "sensibilidade_TUM", "confusao_NORM_TUM", "ic95_bootstrap"):
        assert chave in res
    lo, hi = res["ic95_bootstrap"]["f1_macro"]  # type: ignore[index]
    assert 0 <= lo <= hi <= 1
    assert (tmp_path / "metricas.json").exists() and (tmp_path / "matriz_confusao.png").exists()


def test_metricas_casos_conhecidos() -> None:
    y = np.repeat(np.arange(9), 4)
    p = np.eye(9)[y] * 0.9 + 0.1 / 9
    r = metricas(y, p, n_bootstrap=20)
    assert r["accuracy"] == 1.0 and r["sensibilidade_TUM"] == 1.0 and r["roc_auc_ovr_macro"] == 1.0
    assert ece(y, np.eye(9)[y]) == 0.0


# ----------------------------------------------------------------- Grad-CAM
def test_gradcam_formato_e_faixa(treinado: tuple[Path, Path]) -> None:
    dados, saida = treinado
    m = carregar(str(saida / "melhor.pt"), "resnet18")
    cam = GradCAM(m, camada_alvo(m, "resnet18")[1])
    img = Image.open(next((dados / "TUM").iterdir())).convert("RGB")
    mapa, probs = cam(transformacao_avaliacao()(img).unsqueeze(0))
    assert mapa.shape == (224, 224)
    assert float(mapa.min()) >= 0.0 and float(mapa.max()) <= 1.0
    assert abs(float(probs.sum()) - 1.0) < 1e-4
    mapa_outra, _ = cam(transformacao_avaliacao()(img).unsqueeze(0), classe=CLASSES.index("NORM"))
    assert mapa_outra.shape == (224, 224)
    cam.remover()


@pytest.mark.parametrize("backbone", list(BACKBONES))
def test_gradcam_funciona_em_todos_os_backbones(backbone: str) -> None:
    m = criar(backbone, pretreinado=False)
    cam = GradCAM(m, camada_alvo(m, backbone)[1])
    mapa, probs = cam(torch.randn(1, 3, 224, 224))
    assert mapa.shape == (224, 224) and 0.0 <= float(mapa.min()) <= float(mapa.max()) <= 1.0
    assert abs(float(probs.sum()) - 1.0) < 1e-4
    cam.remover()


def test_gradcam_recusa_lote() -> None:
    m = criar("resnet18", pretreinado=False)
    with pytest.raises(ValueError):
        GradCAM(m, m.layer4)(torch.zeros(2, 3, 224, 224))


# ----------------------------------------------------------------- exportação e latência
def test_exportar_model_card(treinado: tuple[Path, Path], tmp_path: Path) -> None:
    _, saida = treinado
    card = exportar(saida / "melhor.pt", tmp_path, "resnet18-teste", "0.0.1", "resnet18", saida / "treino.json", None)
    pt = tmp_path / card["arquivo"]  # type: ignore[operator]
    assert card["sha256"] == sha256_arquivo(pt) and card["classes"] == list(CLASSES)
    assert (tmp_path / "resnet18-teste-0.0.1.model_card.json").exists()
    carregar(str(pt), "resnet18")  # o arquivo exportado carrega com weights_only=True


def test_latencia() -> None:
    r = medir(criar("resnet18", pretreinado=False), "resnet18", repeticoes=3, aquecimento=1)
    assert r["ms"]["total"]["p95"] > 0 and "atende_rnf01" in r  # type: ignore[index]


def test_cli_dividir(dataset: Path, tmp_path: Path) -> None:
    raiz_ml = Path(__file__).resolve().parents[1]
    r = subprocess.run([sys.executable, "-m", "histolente_ml", "dividir", "--raiz", str(dataset), "--saida", str(tmp_path)],
                       cwd=raiz_ml, capture_output=True, text=True, check=True)
    assert json.loads(r.stdout)["validacao"]["TUM"] >= 1
    assert (tmp_path / "treino.csv").exists()


def test_subamostra_por_classe_balanceia_e_e_deterministica() -> None:
    from histolente_ml.dados import dividir_estratificado
    itens = [(f"{c}/{i}.tif", c) for c in CLASSES for i in range(50 if c != "ADI" else 10)]
    tr, val = dividir_estratificado(itens, 0.2, 7, max_por_classe=20)
    assert sum(1 for _, c in tr + val if c == "TUM") == 20
    assert sum(1 for _, c in tr + val if c == "ADI") == 10
    assert (tr, val) == dividir_estratificado(itens, 0.2, 7, max_por_classe=20)
    assert not {p for p, _ in tr} & {p for p, _ in val}
