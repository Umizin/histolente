"""Teste de fumaça do MVP (ponta a ponta, com a aplicação no ar).

Percorre o fluxo principal pela API pública da web: cadastro, termo, validações de entrada,
análise assíncrona com aviso por SSE, resultado completo, cache e isolamento entre usuários.
Só usa a biblioteca padrão. Rodar com `make fumaca`.
"""
from __future__ import annotations

import http.cookiejar
import json
import os
import random
import struct
import threading
import time
import urllib.error
import urllib.request
import uuid
import zlib

BASE = os.environ.get("WEB_URL", "http://localhost:3000")
CLASSES = ["ADI", "BACK", "DEB", "LYM", "MUC", "MUS", "NORM", "STR", "TUM"]


def png(largura: int, altura: int, semente: int) -> bytes:
    """PNG RGB com ruído em tons de H&E (rosa/roxo), suficiente para não ser lido como fundo."""
    rnd = random.Random(semente)
    linhas = b"".join(
        b"\x00" + bytes(v for _ in range(largura) for v in (rnd.randint(120, 200), rnd.randint(40, 120), rnd.randint(120, 190)))
        for _ in range(altura))
    def bloco(tipo: bytes, dados: bytes) -> bytes:
        return struct.pack(">I", len(dados)) + tipo + dados + struct.pack(">I", zlib.crc32(tipo + dados) & 0xFFFFFFFF)
    return (b"\x89PNG\r\n\x1a\n" + bloco(b"IHDR", struct.pack(">IIBBBBB", largura, altura, 8, 2, 0, 0, 0))
            + bloco(b"IDAT", zlib.compress(linhas)) + bloco(b"IEND", b""))


class Cliente:
    def __init__(self) -> None:
        self.op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))

    def req(self, metodo: str, caminho: str, corpo: bytes | None = None, tipo: str | None = None) -> tuple[int, bytes, str]:
        r = urllib.request.Request(BASE + caminho, data=corpo, method=metodo, headers={"Content-Type": tipo} if tipo else {})
        try:
            with self.op.open(r, timeout=30) as resp:
                return resp.status, resp.read(), resp.headers.get("Content-Type", "")
        except urllib.error.HTTPError as e:
            return e.code, e.read(), e.headers.get("Content-Type", "")

    def json(self, metodo: str, caminho: str, dados: object | None = None) -> tuple[int, dict]:
        st, corpo, _ = self.req(metodo, caminho, json.dumps(dados).encode() if dados is not None else None, "application/json" if dados is not None else None)
        return st, json.loads(corpo or b"{}")

    def enviar(self, dados: bytes, nome: str = "recorte.png") -> tuple[int, dict]:
        limite = uuid.uuid4().hex
        corpo = (f"--{limite}\r\nContent-Disposition: form-data; name=\"imagem\"; filename=\"{nome}\"\r\n"
                 f"Content-Type: image/png\r\n\r\n").encode() + dados + f"\r\n--{limite}--\r\n".encode()
        st, resp, _ = self.req("POST", "/api/analyses", corpo, f"multipart/form-data; boundary={limite}")
        return st, json.loads(resp)

    def cadastrar(self) -> None:
        st, _ = self.json("POST", "/api/auth/register", {"nome": "Teste Fumaça", "email": f"fumaca-{uuid.uuid4().hex[:10]}@exemplo.org", "senha": "senha-de-teste-123"})
        assert st == 201


def ouvir_sse(cliente: Cliente, eventos: list[dict], pronto: threading.Event) -> None:
    with cliente.op.open(urllib.request.Request(BASE + "/api/events"), timeout=120) as resp:
        evento = ""
        for linha in resp:
            texto = linha.decode().rstrip("\n")
            if texto.startswith("event: "):
                evento = texto[7:]
            elif texto.startswith("data: ") and evento == "ready":
                pronto.set()
            elif texto.startswith("data: ") and evento == "analysis":
                eventos.append(json.loads(texto[6:]))
                return


def test_fluxo_completo() -> None:
    st, _, _ = Cliente().req("GET", "/api/healthz")
    assert st == 200

    c = Cliente()
    assert c.req("GET", "/api/analyses")[0] == 401
    c.cadastrar()
    imagem = png(300, 260, semente=int(time.time()))

    st, j = c.enviar(imagem)
    assert st == 403 and j["error"]["code"] == "TERMS_REQUIRED"          # RF07: termo antes de usar
    assert c.json("POST", "/api/consent")[0] == 200

    st, j = c.enviar(png(100, 100, 1))
    assert st == 422 and j["error"]["code"] == "IMAGE_TOO_SMALL"          # RN01: sem reduzir a escala
    st, j = c.enviar(b"GIF89a" + b"\x00" * 64, "falso.png")
    assert st == 415                                                       # RN01: tipo real pelo conteúdo

    # SSE aberto antes do envio
    eventos: list[dict] = []
    pronto = threading.Event()
    t = threading.Thread(target=ouvir_sse, args=(c, eventos, pronto), daemon=True)
    t.start()
    assert pronto.wait(10), "SSE não respondeu"

    inicio = time.monotonic()
    st, j = c.enviar(imagem)
    assert st == 202 and j["status"] == "QUEUED"
    analise_id = j["analysisId"]
    t.join(90)
    assert eventos and eventos[0]["analysisId"] == analise_id and eventos[0]["status"] == "DONE"
    print(f"\nponta a ponta (envio -> evento SSE): {(time.monotonic() - inicio) * 1000:.0f} ms")

    st, a = c.json("GET", f"/api/analyses/{analise_id}")
    assert st == 200 and a["status"] == "DONE"
    assert a["predictedClass"] in CLASSES and set(a["probabilities"]) == set(CLASSES)
    assert abs(sum(a["probabilities"].values()) - 1) <= 1e-4               # RF03
    assert len(a["model"]["sha256"]) == 64 and a["model"]["version"]       # rastreabilidade do modelo
    st, corpo, tipo = c.req("GET", f"/api/analyses/{analise_id}/heatmap")
    assert st == 200 and tipo == "image/png" and corpo[:8] == b"\x89PNG\r\n\x1a\n"   # RF04

    st, j = c.enviar(imagem)                                               # mesma imagem: cache
    assert st == 200 and j["status"] == "DONE" and j["result"]["cacheHit"] is True
    assert j["result"]["predictedClass"] == a["predictedClass"]

    st, h = c.json("GET", "/api/analyses")
    assert st == 200 and h["total"] == 2                                   # RF06

    outro = Cliente()
    outro.cadastrar()
    assert outro.req("GET", f"/api/analyses/{analise_id}")[0] == 404       # isolamento entre usuários
    assert outro.req("GET", f"/api/analyses/{analise_id}/image")[0] == 404
