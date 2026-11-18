"""Converte os blocos ```mermaid de docs/projeto/*.md em SVG (docs/projeto/figuras/<arquivo>-<n>.svg).

Usa o Chrome headless com o Mermaid 11.4.1 (jsdelivr). Uso: python3 -I tools/mermaid_svg.py
"""
from __future__ import annotations

import html
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PASTA = ROOT / "docs/projeto"
SAIDA = PASTA / "figuras"
BLOCO = re.compile(r"```mermaid\n(.*?)```", re.S)


def main() -> None:
    chrome = shutil.which("google-chrome") or shutil.which("chromium")
    if not chrome:
        raise SystemExit("Chrome não encontrado")
    alvos: list[tuple[str, str]] = []
    for md in sorted(PASTA.glob("[0-9][0-9]-*.md")):
        for k, codigo in enumerate(BLOCO.findall(md.read_text(encoding="utf-8")), 1):
            alvos.append((f"{md.stem}-{k}", codigo))
    divs = "\n".join(f'<div class="mermaid" id="{n}">{html.escape(c)}</div>' for n, c in alvos)
    pagina = f"""<!doctype html><html><head><meta charset="utf-8"></head><body>{divs}
<script src="https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js"></script>
<script>
mermaid.initialize({{startOnLoad:false, theme:"neutral", fontFamily:"Arial, Helvetica, sans-serif",
  flowchart:{{htmlLabels:false}}, class:{{htmlLabels:false}}, er:{{useMaxWidth:false}}, sequence:{{useMaxWidth:false}}}});
mermaid.run().then(()=>document.title="OK").catch(e=>document.title="ERRO "+e);
</script></body></html>"""
    with tempfile.TemporaryDirectory() as tmp:
        h = Path(tmp) / "m.html"
        h.write_text(pagina, encoding="utf-8")
        dom = subprocess.run([chrome, "--headless=new", "--disable-gpu", "--no-sandbox", "--virtual-time-budget=20000",
                              "--dump-dom", f"file://{h}"], capture_output=True, text=True, check=True).stdout
    if "<title>OK</title>" not in dom:
        raise SystemExit("Falha ao renderizar: " + (re.search(r"<title>(.*?)</title>", dom) or [None, "?"])[1])
    SAIDA.mkdir(parents=True, exist_ok=True)
    for nome, _ in alvos:
        m = re.search(rf'<div class="mermaid" id="{re.escape(nome)}"[^>]*>(<svg.*?</svg>)\s*</div>', dom, re.S)
        if not m:
            raise SystemExit(f"SVG não encontrado: {nome}")
        svg = m.group(1).replace("&nbsp;", "&#160;").replace("<br>", "<br/>")
        (SAIDA / f"{nome}.svg").write_text(svg, encoding="utf-8")
        print("ok", nome)


if __name__ == "__main__":
    main()
