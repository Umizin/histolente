"""Gera os diagramas SVG do projeto (sem dependências externas).

Uso: python3 -I tools/diagramas.py
Saídas:
  docs/engenharia-requisitos/casos-de-uso.svg  (espelha casos-de-uso.puml)
  docs/monografia/figuras/arquitetura.svg       (arquitetura orientada a eventos — Cap. 4)
"""
from __future__ import annotations

import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEAL = "#0F766E"
FONT = 'font-family="Arial, Helvetica, sans-serif"'


def _esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


# --------------------------------------------------------------------------- casos de uso
def casos_de_uso() -> str:
    rx, ry = 112, 29
    ucs = {
        "UC12": (360, 55, ["UC12 Gerenciar versão", "ativa do modelo"]),
        "UC13": (360, 125, ["UC13 Gerenciar", "usuários"]),
        "UC01": (360, 200, ["UC01 Autenticar-se"]),
        "UC10": (360, 275, ["UC10 Consultar histórico", "de análises"]),
        "UC15": (360, 350, ["UC15 Acompanhar", "progresso"]),
        "UC07": (360, 430, ["UC07 Visualizar resultado", "da classificação"]),
        "UC02": (360, 510, ["UC02 Enviar patch", "para análise"]),
        "UC03": (360, 590, ["UC03 Analisar amostra", "da galeria"]),
        "UC09": (360, 670, ["UC09 Praticar em", "modo quiz"]),
        "UC14": (360, 750, ["UC14 Comparar classes", "confundíveis"]),
        "UC04": (360, 845, ["UC04 Enviar lote", "de patches"]),
        "UC11": (630, 275, ["UC11 Exportar", "histórico (CSV)"]),
        "UC08": (630, 430, ["UC08 Explorar Grad-CAM", "(opacidade, lado a lado, zoom)"]),
        "UC05": (630, 590, ["UC05 Classificar patch"]),
        "UC06": (915, 590, ["UC06 Gerar mapa", "Grad-CAM"]),
    }
    actors = {
        "ADM": (95, 125, ["Administrador"]),
        "EST": (95, 430, ["Estudante de", "Medicina"]),
        "PROF": (95, 845, ["Professor de", "Patologia"]),
        "WK": (1150, 680, ["Serviço de Inferência", "(Worker de IA)", "«sistema»"]),
    }
    assoc = [("ADM", u) for u in ("UC12", "UC13", "UC01")] + \
            [("EST", u) for u in ("UC10", "UC15", "UC07", "UC02", "UC03")] + \
            [("PROF", "UC04"), ("WK", "UC06"), ("WK", "UC05")]
    deps = [("UC02", "UC05", "«include»"), ("UC03", "UC05", "«include»"), ("UC04", "UC05", "«include»"),
            ("UC05", "UC06", "«include»"), ("UC11", "UC10", "«extend»"), ("UC08", "UC07", "«extend»"),
            ("UC09", "UC03", "«extend»")]

    def edge(cx: float, cy: float, tx: float, ty: float) -> tuple[float, float]:
        dx, dy = tx - cx, ty - cy
        t = 1 / math.sqrt((dx / rx) ** 2 + (dy / ry) ** 2)
        return cx + dx * t, cy + dy * t

    w, h = 1270, 905
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" {FONT}>',
         '<defs><marker id="open" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="9" markerHeight="9" '
         'orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10" fill="none" stroke="#333" stroke-width="1.4"/></marker>'
         '<marker id="tri" viewBox="0 0 12 12" refX="12" refY="6" markerWidth="14" markerHeight="14" orient="auto">'
         '<path d="M0,0 L12,6 L0,12 Z" fill="#fff" stroke="#333" stroke-width="1.2"/></marker></defs>',
         f'<rect width="{w}" height="{h}" fill="#fff"/>',
         '<rect x="215" y="12" width="840" height="885" fill="none" stroke="#333" stroke-width="1.4" rx="4"/>',
         '<text x="1043" y="34" text-anchor="end" font-size="17" font-weight="bold">HistoLente</text>']
    for a, u in assoc:
        ux, uy, _ = ucs[u]
        x, y, _ = actors[a]
        ax, ay = (x + 22 if ux > x else x - 22), y - 10
        ex, ey = edge(ux, uy, ax, ay)
        o.append(f'<line x1="{ax}" y1="{ay}" x2="{ex:.1f}" y2="{ey:.1f}" stroke="#333" stroke-width="1.2"/>')
    ex1, ey1 = edge(360, 200, 225, 215)  # Estudante -> UC01 contornando o UC10
    o.append(f'<polyline points="117,420 225,218 {ex1:.1f},{ey1:.1f}" fill="none" stroke="#333" stroke-width="1.2"/>')
    for s, d, st in deps:
        sx, sy, _ = ucs[s]
        dx_, dy_, _ = ucs[d]
        x1, y1 = edge(sx, sy, dx_, dy_)
        x2, y2 = edge(dx_, dy_, sx, sy)
        o.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="#333" stroke-width="1.1" '
                 'stroke-dasharray="6,4" marker-end="url(#open)"/>')
        horiz = abs(y2 - y1) < 5
        o.append(f'<text x="{(x1 + x2) / 2 + (0 if horiz else 8):.1f}" y="{(y1 + y2) / 2 - (6 if horiz else 0):.1f}" '
                 f'font-size="13" fill="#444" text-anchor="{"middle" if horiz else "start"}">{st}</text>')
    x14, y14, _ = ucs["UC14"]
    x03, y03, _ = ucs["UC03"]
    o.append(f'<path d="M{x14 - rx + 6},{y14 - 8} C 230,{y14 - 30} 230,{y03 + 30} {x03 - rx + 4},{y03 + 9}" '
             'fill="none" stroke="#333" stroke-width="1.1" stroke-dasharray="6,4" marker-end="url(#open)"/>')
    o.append(f'<text x="250" y="{(y14 + y03) / 2 + 30:.0f}" font-size="13" fill="#444">«extend»</text>')
    o.append('<line x1="95" y1="790" x2="95" y2="510" stroke="#333" stroke-width="1.2" marker-end="url(#tri)"/>')
    for x, y, lines in ucs.values():
        o.append(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="#F4FBFA" stroke="{TEAL}" stroke-width="1.5"/>')
        for i, ln in enumerate(lines):
            fy = y + 5 + (i - (len(lines) - 1) / 2) * 16
            o.append(f'<text x="{x}" y="{fy:.1f}" text-anchor="middle" font-size="{15 if len(ln) < 27 else 13}">{_esc(ln)}</text>')
    for x, y, lines in actors.values():
        o.append(f'<g stroke="#333" stroke-width="1.6" fill="none"><circle cx="{x}" cy="{y - 42}" r="11" fill="#fff"/>'
                 f'<line x1="{x}" y1="{y - 31}" x2="{x}" y2="{y - 2}"/><line x1="{x - 18}" y1="{y - 22}" x2="{x + 18}" y2="{y - 22}"/>'
                 f'<line x1="{x}" y1="{y - 2}" x2="{x - 14}" y2="{y + 20}"/><line x1="{x}" y1="{y - 2}" x2="{x + 14}" y2="{y + 20}"/></g>')
        for i, ln in enumerate(lines):
            o.append(f'<text x="{x}" y="{y + 40 + i * 16}" text-anchor="middle" font-size="14">{_esc(ln)}</text>')
    nx, ny = 655, 730
    o.append(f'<path d="M{nx},{ny} h345 v70 h-355 v-60 z" fill="#FFF8E6" stroke="#B45309" stroke-width="1"/>')
    for i, t in enumerate(["RF07 — Todas as telas exibem o aviso: ferramenta",
                           "educacional e de apoio à triagem, não substitui",
                           "laudo (Res. CFM nº 2.454/2026)."]):
        o.append(f'<text x="{nx - 2}" y="{ny + 20 + i * 17}" font-size="13.5">{t}</text>')
    o.append("</svg>")
    return "\n".join(o)


# --------------------------------------------------------------------------- arquitetura
def arquitetura() -> str:
    w, h = 1250, 640
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" {FONT}>',
         '<defs><marker id="a" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto">'
         '<path d="M0,0 L10,5 L0,10 Z" fill="#333"/></marker></defs>',
         f'<rect width="{w}" height="{h}" fill="#fff"/>']

    def domain(x: int, y: int, ww: int, hh: int, title: str, fill: str) -> None:
        o.append(f'<rect x="{x}" y="{y}" width="{ww}" height="{hh}" rx="8" fill="{fill}" stroke="#555" stroke-width="1.2" stroke-dasharray="5,3"/>')
        o.append(f'<text x="{x + 10}" y="{y + 20}" font-size="14" font-weight="bold" fill="#0F3D3A">{_esc(title)}</text>')

    def node(x: int, y: int, ww: int, hh: int, lines: list[str], fill: str = "#fff", bold_first: bool = True) -> None:
        o.append(f'<rect x="{x}" y="{y}" width="{ww}" height="{hh}" rx="6" fill="{fill}" stroke="{TEAL}" stroke-width="1.6"/>')
        n = len(lines)
        for i, ln in enumerate(lines):
            fy = y + hh / 2 + 5 + (i - (n - 1) / 2) * 16
            fw = ' font-weight="bold"' if (i == 0 and bold_first) else ""
            o.append(f'<text x="{x + ww / 2}" y="{fy:.1f}" text-anchor="middle" font-size="13"{fw}>{_esc(ln)}</text>')

    def cyl(x: int, y: int, ww: int, hh: int, lines: list[str]) -> None:
        e = 10
        o.append(f'<path d="M{x},{y + e} v{hh - 2 * e} a{ww / 2},{e} 0 0 0 {ww},0 v{-(hh - 2 * e)}" fill="#fff" stroke="{TEAL}" stroke-width="1.6"/>')
        o.append(f'<ellipse cx="{x + ww / 2}" cy="{y + e}" rx="{ww / 2}" ry="{e}" fill="#fff" stroke="{TEAL}" stroke-width="1.6"/>')
        for i, ln in enumerate(lines):
            fy = y + hh / 2 + 10 + (i - (len(lines) - 1) / 2) * 16
            fw = ' font-weight="bold"' if i == 0 else ""
            o.append(f'<text x="{x + ww / 2}" y="{fy:.1f}" text-anchor="middle" font-size="13"{fw}>{_esc(ln)}</text>')

    def queue(x: int, y: int, ww: int, label: str) -> None:
        o.append(f'<rect x="{x}" y="{y}" width="{ww}" height="34" rx="17" fill="#EEF6F5" stroke="{TEAL}" stroke-width="1.4"/>')
        for k in range(1, 4):
            o.append(f'<line x1="{x + ww - 18 * k}" y1="{y + 6}" x2="{x + ww - 18 * k}" y2="{y + 28}" stroke="{TEAL}" stroke-width="1"/>')
        o.append(f'<text x="{x + 14}" y="{y + 22}" font-size="13" font-family="DejaVu Sans Mono, monospace">{label}</text>')

    def arrow(pts: list[tuple[float, float]], label: str = "", lx: float = 0, ly: float = 0, dashed: bool = False,
              anchor: str = "middle") -> None:
        d = " ".join(f"{x},{y}" for x, y in pts)
        da = ' stroke-dasharray="6,4"' if dashed else ""
        o.append(f'<polyline points="{d}" fill="none" stroke="#333" stroke-width="1.4"{da} marker-end="url(#a)"/>')
        if label:
            wbox = len(label) * 6.6 + 8
            bx = lx - wbox / 2 if anchor == "middle" else (lx - 4 if anchor == "start" else lx - wbox + 4)
            o.append(f'<rect x="{bx:.1f}" y="{ly - 12}" width="{wbox:.1f}" height="16" fill="#fff" opacity="0.92"/>')
            o.append(f'<text x="{lx}" y="{ly}" font-size="12" text-anchor="{anchor}" fill="#222">{_esc(label)}</text>')

    domain(15, 50, 225, 200, "Camada de Apresentação", "#F7FAFC")
    domain(285, 50, 300, 330, "Camada de Orquestração", "#F7FAFC")
    domain(640, 50, 250, 420, "Mensageria e cache", "#FAFAF5")
    domain(940, 50, 295, 330, "Aprendizado de Máquina (isolada)", "#F5FAF7")

    node(35, 95, 185, 120, ["Frontend", "Next.js (App Router,", "TypeScript), Tailwind,", "shadcn/ui"])
    node(305, 95, 260, 95, ["Backend de Orquestração", "API REST + endpoint SSE", "autenticação · validação · SHA-256"])
    node(305, 280, 260, 75, ["Consumidor de resultados", "fila inference.completed"])
    cyl(660, 85, 210, 90, ["Redis", "cache SHA-256 · estado", "dos jobs · Pub/Sub"])
    queue(650, 225, 232, "inference.request")
    queue(650, 330, 232, "inference.completed")
    queue(650, 405, 232, "inference.dlq")
    node(965, 175, 245, 85, ["Worker de Inferência", "FastAPI + PyTorch", "CNN + Grad-CAM"])
    node(1000, 300, 175, 55, ["Modelo .pt versionado", "(volume somente leitura)"], fill="#FBFBFB")
    o.append('<rect x="958" y="92" width="260" height="58" rx="6" fill="#FFF8E6" stroke="#B45309" stroke-width="1"/>')
    o.append('<text x="1088" y="116" text-anchor="middle" font-size="12.5" font-weight="bold">Sem acesso ao PostgreSQL (RNF06)</text>')
    o.append('<text x="1088" y="134" text-anchor="middle" font-size="12">comunica-se apenas pelo RabbitMQ</text>')
    cyl(45, 450, 230, 95, ["PostgreSQL", "usuários · imagens · análises", "versão do modelo"])
    o.append('<rect x="985" y="470" width="205" height="70" rx="6" fill="#fff" stroke="#777" stroke-width="1.3" stroke-dasharray="5,3"/>')
    o.append('<text x="1087" y="498" text-anchor="middle" font-size="13" font-weight="bold">Pipeline de treino offline</text>')
    o.append('<text x="1087" y="516" text-anchor="middle" font-size="12">PyTorch · NCT-CRC-HE-100K</text>')
    o.append('<text x="1087" y="532" text-anchor="middle" font-size="12">(fora do fluxo de produção)</text>')

    arrow([(220, 120), (305, 120)], "1. POST /api/analyses", 262, 112)
    arrow([(305, 175), (220, 175)], "11. evento SSE", 262, 194)
    arrow([(565, 115), (660, 115)], "2. consulta cache", 612, 107)
    arrow([(660, 150), (565, 150)], "10. Pub/Sub", 612, 170)
    arrow([(330, 190), (210, 452)], "3. registra (QUEUED)", 258, 330, anchor="end")
    arrow([(565, 182), (650, 236)], "4. publica job", 598, 202, anchor="start")
    arrow([(882, 242), (965, 210)], "5. consome", 922, 214)
    arrow([(965, 245), (882, 345)], "6. publica resultado", 912, 300, anchor="end")
    arrow([(985, 260), (882, 418)], "falha após retries", 935, 405, dashed=True, anchor="start")
    arrow([(650, 347), (565, 330)], "7. consome", 607, 362)
    arrow([(330, 355), (250, 455)], "8. persiste (DONE)", 300, 430, anchor="start")
    arrow([(520, 280), (690, 175)], "9. cache + PUBLISH", 540, 270, anchor="end")
    arrow([(1087, 300), (1087, 260)], dashed=True)
    o.append('<text x="1095" y="285" font-size="12" fill="#444">carrega</text>')
    arrow([(1087, 470), (1087, 355)], dashed=True)
    o.append('<text x="1095" y="420" font-size="12" fill="#444">gera .pt + model card</text>')
    o.append("</svg>")
    return "\n".join(o)


if __name__ == "__main__":
    uc = ROOT / "docs/engenharia-requisitos/casos-de-uso.svg"
    arq = ROOT / "docs/monografia/figuras/arquitetura.svg"
    arq.parent.mkdir(parents=True, exist_ok=True)
    uc.write_text(casos_de_uso(), encoding="utf-8")
    arq.write_text(arquitetura(), encoding="utf-8")
    print("ok", uc, arq, sep="\n")
