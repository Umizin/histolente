"""Converte os Markdown do projeto em PDF (HTML + Chrome headless), sem dependências externas.

Uso:
  python3 -I tools/md2pdf.py monografia   → docs/monografia/monografia-versao-trabalho.pdf
  python3 -I tools/md2pdf.py requisitos   → docs/engenharia-requisitos/artefatos-engenharia-requisitos.pdf
  python3 -I tools/md2pdf.py todos

Recursos de Markdown suportados: títulos, parágrafos, **negrito**, *itálico*, `código`, ~~riscado~~, links,
citações (>), listas (com um nível de aninhamento), tabelas, blocos de código, imagens em linha própria
(`![alt](arquivo.svg)` e `![alt](arquivo.svg){.paisagem}` para página deitada) e a diretiva de inclusão
  @@incluir caminho/arquivo.md | Título exato da seção@@
que copia a seção (até o próximo título de mesmo nível ou superior), rebaixando-a para nível 2.
"""
from __future__ import annotations

import html
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# ----------------------------------------------------------------------------- inclusão de seções
INC = re.compile(r"^@@incluir\s+(.+?)\s*\|\s*(.+?)@@\s*$", re.M)


def _secao(md: str, titulo: str) -> str:
    linhas = md.split("\n")
    em_codigo = [False] * len(linhas)  # linhas dentro de blocos ``` (ex.: "# language: pt" do Gherkin) não são títulos
    dentro = False
    for k, ln in enumerate(linhas):
        if ln.startswith("```"):
            dentro = not dentro
            em_codigo[k] = True
        else:
            em_codigo[k] = dentro
    for i, ln in enumerate(linhas):
        m = None if em_codigo[i] else re.match(r"^(#{1,6})\s+(.*)$", ln)
        if m and m.group(2).strip() == titulo.strip():
            nivel = len(m.group(1))
            fim = len(linhas)
            for j in range(i + 1, len(linhas)):
                m2 = None if em_codigo[j] else re.match(r"^(#{1,6})\s", linhas[j])
                if m2 and len(m2.group(1)) <= nivel:
                    fim = j
                    break
            corpo = linhas[i + 1:fim]
            titulo_limpo = re.sub(r"^\d+(\.\d+)*\s+", "", m.group(2).strip())
            delta = nivel - 2
            out = [f"## {titulo_limpo}"]
            for k, c in enumerate(corpo):
                mh = None if em_codigo[i + 1 + k] else re.match(r"^(#{1,6})(\s.*)$", c)
                out.append(("#" * max(3, len(mh.group(1)) - delta) + mh.group(2)) if mh else c)
            return "\n".join(out)
    raise SystemExit(f"Seção não encontrada para inclusão: {titulo!r}")


def resolver_inclusoes(md: str, base: Path) -> str:
    def rep(m: re.Match[str]) -> str:
        alvo = (base / m.group(1)).resolve()
        texto = alvo.read_text(encoding="utf-8")
        sec = _secao(texto, m.group(2))
        # imagens relativas ao arquivo incluído → absolutas
        return re.sub(r"!\[([^\]]*)\]\(([^)]+)\)", lambda mm: f"![{mm.group(1)}]({(alvo.parent / mm.group(2)).resolve()})", sec)
    return INC.sub(rep, md)


# ----------------------------------------------------------------------------- Markdown → HTML
def _inline(s: str) -> str:
    s = html.escape(s, quote=False)
    codes: list[str] = []
    s = re.sub(r"`([^`]+)`", lambda m: codes.append(m.group(1)) or f"\x00{len(codes) - 1}\x00", s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?!\w)", r"<em>\1</em>", s)
    s = re.sub(r"~~(.+?)~~", r"<del>\1</del>", s)
    s = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1", s)  # links internos de markdown → texto
    s = re.sub(r"(https?://[^\s<)|]+[^\s<)|.,;])", r'<a href="\1">\1</a>', s)
    s = re.sub(r"\x00(\d+)\x00", lambda m: f"<code>{codes[int(m.group(1))]}</code>", s)
    return s


def _row(r: str) -> list[str]:
    return [c.strip() for c in re.split(r"(?<!\\)\|", r.strip().strip("|"))]


IMG = re.compile(r"^!\[([^\]]*)\]\(([^)]+)\)(\{\.paisagem\})?\s*$")
BLOCO = re.compile(r"^(#|\||>|```|\s*([-*]|\d+\.) |---$|!\[)")


def md_para_html(md: str, base: Path) -> str:
    lines = md.split("\n")
    out: list[str] = []
    i = 0
    while i < len(lines):
        ln = lines[i]
        mi = IMG.match(ln)
        if mi:
            src = Path(mi.group(2))
            src = src if src.is_absolute() else (base / src).resolve()
            cls = ' class="paisagem"' if mi.group(3) else ""
            out.append(f'<figure{cls}><img src="file://{src}" alt="{html.escape(mi.group(1))}"/></figure>')
            i += 1
        elif ln.startswith("```"):
            lang = ln[3:].strip()
            j, buf = i + 1, []
            while j < len(lines) and not lines[j].startswith("```"):
                buf.append(lines[j])
                j += 1
            out.append(f'<pre class="{lang}"><code>{html.escape(chr(10).join(buf))}</code></pre>')
            i = j + 1
        elif re.match(r"^#{1,6} ", ln):
            lvl = len(ln) - len(ln.lstrip("#"))
            out.append(f"<h{lvl}>{_inline(ln[lvl + 1:].strip())}</h{lvl}>")
            i += 1
        elif ln.strip() == "---":
            i += 1
        elif ln.startswith("|") and i + 1 < len(lines) and re.match(r"^\|[\s:|-]+\|\s*$", lines[i + 1]):
            head, j, rows = _row(ln), i + 2, []
            while j < len(lines) and lines[j].startswith("|"):
                rows.append(_row(lines[j]))
                j += 1
            t = ["<table><thead><tr>" + "".join(f"<th>{_inline(c)}</th>" for c in head) + "</tr></thead><tbody>"]
            t += ["<tr>" + "".join(f"<td>{_inline(c)}</td>" for c in r) + "</tr>" for r in rows]
            out.append("".join(t) + "</tbody></table>")
            i = j
        elif ln.startswith(">"):
            buf = []
            while i < len(lines) and lines[i].startswith(">"):
                buf.append(lines[i][1:].strip())
                i += 1
            out.append("<blockquote><p>" + "<br/>".join(_inline(b) for b in buf if b) + "</p></blockquote>")
        elif re.match(r"^\s*([-*]|\d+\.) ", ln):
            stack: list[tuple[int, str]] = []
            buf = []
            while i < len(lines) and re.match(r"^\s*([-*]|\d+\.) ", lines[i]):
                m = re.match(r"^(\s*)([-*]|\d+\.) (.*)$", lines[i])
                assert m
                ind, mark, body = len(m.group(1)), m.group(2), m.group(3)
                tag = "ol" if mark[0].isdigit() else "ul"
                if not stack or ind > stack[-1][0]:
                    buf.append(f"<{tag}>")
                    stack.append((ind, tag))
                else:
                    while stack and ind < stack[-1][0]:
                        buf.append(f"</li></{stack.pop()[1]}>")
                    buf.append("</li>")
                buf.append(f"<li>{_inline(body)}")
                i += 1
            while stack:
                buf.append(f"</li></{stack.pop()[1]}>")
            out.append("".join(buf))
        elif not ln.strip():
            i += 1
        else:
            buf = []
            while i < len(lines) and lines[i].strip() and not BLOCO.match(lines[i]):
                buf.append(_inline(lines[i].strip()))
                i += 1
            out.append("<p>" + "<br/>".join(buf) + "</p>")
    body = "\n".join(out)
    # figura em página deitada: título (parágrafo anterior), figura e fonte (parágrafo seguinte) juntos
    body = re.sub(r'(<p><strong>Figura \d+(?:(?!</p>).)*</p>\n)(?:(<p>(?:(?!</p>).)*</p>\n))?<figure class="paisagem">(.*?)</figure>\n(<p>Fonte:.*?</p>)',
                  lambda m: f'<div class="paisagem">{m.group(1)}{m.group(2) or ""}<figure>{m.group(3)}</figure>{m.group(4)}</div>',
                  body, flags=re.S)
    return body


# ----------------------------------------------------------------------------- estilos e capas
CSS_BASE = """
@page { size: A4; margin: 3cm 2cm 2cm 3cm;
  @top-right { content: counter(page); font: 10pt Arial, sans-serif; color: #333; } }
@page :first { @top-right { content: none; } }
@page paisagem { size: A4 landscape; margin: 1.5cm 2cm; }
* { box-sizing: border-box; }
body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; }
.capa { height: 24.5cm; display: flex; flex-direction: column; justify-content: space-between; text-align: center;
  page-break-after: always; font-weight: bold; font-size: 12pt; line-height: 1.5; }
.capa .titulo { font-size: 13pt; }
.capa .sub { font-weight: normal; font-size: 11pt; }
.capa .nota { font-weight: normal; font-size: 9pt; color: #666; }
h1, h2, h3, h4 { page-break-after: avoid; break-after: avoid; color: #111; }
table { width: 100%; border-collapse: collapse; margin: 8pt 0 12pt; font-size: 9pt; line-height: 1.3; }
th, td { border: 0.6pt solid #777; padding: 3pt 4pt; vertical-align: top; text-align: left; }
th { background: #EEF3F2; }
tr { page-break-inside: avoid; break-inside: avoid; }
thead { display: table-header-group; }
blockquote { margin: 8pt 0; padding: 6pt 10pt; background: #F5F7F8; border-left: 3pt solid #0F766E; font-size: 10.5pt; }
blockquote p { margin: 0; text-indent: 0; }
pre { background: #F5F7F8; border: 0.6pt solid #ccc; padding: 6pt 8pt; font-size: 8.8pt; line-height: 1.35;
  white-space: pre-wrap; page-break-inside: avoid; break-inside: avoid; }
code { font-family: "DejaVu Sans Mono", Consolas, monospace; font-size: 0.88em; }
ul, ol { margin: 4pt 0 6pt; padding-left: 20pt; }
li { margin: 2pt 0; }
figure { margin: 8pt 0; text-align: center; page-break-inside: avoid; }
figure img { width: 100%; }
.paisagem { page: paisagem; page-break-before: always; text-align: center; }
.paisagem p { text-align: center !important; text-indent: 0 !important; margin: 2pt 0; }
.paisagem figure img { width: auto; max-width: 100%; height: 14.8cm; }
a { color: #0F5E57; text-decoration: none; word-break: break-all; }
del { color: #777; }
"""

CSS_MONOGRAFIA = """
body { font-size: 12pt; line-height: 1.5; }
h1 { font-size: 12pt; font-weight: bold; text-transform: uppercase; page-break-before: always; margin: 0 0 18pt; }
h2 { font-size: 12pt; font-weight: bold; margin: 18pt 0 8pt; }
h3 { font-size: 12pt; font-weight: normal; font-style: italic; margin: 14pt 0 6pt; }
h4 { font-size: 12pt; font-weight: normal; margin: 12pt 0 6pt; }
p { margin: 0 0 6pt; text-align: justify; text-indent: 1.25cm; }
td p, li p { text-indent: 0; }
table + p, figure + p { text-indent: 0; }
.ref p { text-indent: 0; text-align: left; line-height: 1.0; margin-bottom: 12pt; }
"""

CSS_REQUISITOS = """
body { font-size: 11.5pt; line-height: 1.45; }
h2 { font-size: 13.5pt; text-transform: uppercase; margin: 0 0 10pt; color: #0F3D3A; page-break-before: always; }
h2.semquebra { page-break-before: auto; }
h3 { font-size: 12pt; margin: 16pt 0 6pt; color: #0F3D3A; }
h4 { font-size: 11.5pt; margin: 14pt 0 6pt; }
p { margin: 5pt 0; text-align: justify; }
"""


def capa(titulo: str, sub: str = "", nota: str = "") -> str:
    return f"""<section class="capa">
<div>UNIVERSIDADE DE VASSOURAS<br/>CAMPUS MARICÁ<br/>CURSO DE ENGENHARIA DE SOFTWARE</div>
<div>PAULO VICTOR SILVA GONÇALVES</div>
<div class="titulo">{titulo}</div>
<div class="sub">{sub}</div>
<div>Maricá<br/>2026<br/><span class="nota">{nota}</span></div>
</section>"""


def imprimir(doc_html: str, destino: Path) -> None:
    chrome = shutil.which("google-chrome") or shutil.which("chromium") or shutil.which("chromium-browser")
    if not chrome:
        raise SystemExit("Chrome/Chromium não encontrado.")
    with tempfile.TemporaryDirectory() as tmp:
        h = Path(tmp) / "doc.html"
        h.write_text(doc_html, encoding="utf-8")
        subprocess.run([chrome, "--headless=new", "--disable-gpu", "--no-sandbox", "--allow-file-access-from-files",
                        "--no-pdf-header-footer", f"--print-to-pdf={destino}", f"file://{h}"],
                       check=True, capture_output=True)
    print("ok", destino)


def _html(titulo: str, css: str, corpo: str) -> str:
    return (f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/><title>{titulo}</title>'
            f"<style>{CSS_BASE}{css}</style></head><body>{corpo}</body></html>")


# ----------------------------------------------------------------------------- documentos
def monografia() -> None:
    pasta = ROOT / "docs/monografia"
    partes = []
    for f in sorted(pasta.glob("[0-9][0-9]-*.md")):
        md = resolver_inclusoes(f.read_text(encoding="utf-8"), f.parent)
        corpo = md_para_html(md, f.parent)
        if f.name.startswith("90-"):
            corpo = f'<div class="ref">{corpo}</div>'
        partes.append(corpo)
    titulo = ("RECONHECIMENTO AUTOMATIZADO DE PADRÕES HISTOLÓGICOS EM CÂNCER COLORRETAL COM INTELIGÊNCIA "
              "ARTIFICIAL: UMA FERRAMENTA DE APOIO À PATOLOGIA DIGITAL")
    nota = f"Versão de trabalho gerada em {date.today().strftime('%d/%m/%Y')} a partir de docs/monografia/*.md"
    corpo = capa(titulo, "", nota) + "\n".join(partes)
    imprimir(_html("Monografia — versão de trabalho", CSS_MONOGRAFIA, corpo), pasta / "monografia-versao-trabalho.pdf")


def requisitos() -> None:
    f = ROOT / "docs/engenharia-requisitos/artefatos-engenharia-requisitos.md"
    corpo = md_para_html(f.read_text(encoding="utf-8"), f.parent)
    corpo = re.sub(r"^<h1>.*?</h1>\n<p>.*?</p>\n", "", corpo, count=1, flags=re.S)  # título/identificação → capa
    corpo = corpo.replace("<h2>Sumário</h2>", '<h2 class="semquebra">Sumário</h2>', 1)
    sub = ("Projeto: Reconhecimento Automatizado de Padrões Histológicos em Câncer Colorretal com Inteligência "
           "Artificial: Uma Ferramenta de Apoio à Patologia Digital")
    imprimir(_html("Artefatos de Engenharia de Requisitos", CSS_REQUISITOS,
                   capa("ARTEFATOS DE ENGENHARIA DE REQUISITOS", sub) + corpo),
             f.with_suffix(".pdf"))


if __name__ == "__main__":
    alvo = sys.argv[1] if len(sys.argv) > 1 else "todos"
    if alvo in ("monografia", "todos"):
        monografia()
    if alvo in ("requisitos", "todos"):
        requisitos()
