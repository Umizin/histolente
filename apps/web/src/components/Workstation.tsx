"use client";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { CLASSES, INFO, LIMIAR_BAIXA_CONFIANCA, diferenca, ehClasse, type Classe } from "@/lib/classes";
import { colorir, gradiente, type Paleta } from "@/lib/cores";

type Analise = {
  id: string; status: "QUEUED" | "PROCESSING" | "DONE" | "FAILED"; predictedClass: string | null;
  probabilities: Record<string, number> | null; outOfDistribution: boolean; cacheHit: boolean;
  workerMs: number | null; e2eMs: number | null; error: string | null; groundTruth: string | null;
  model: { name: string; version: string; sha256: string }; hasHeatmap: boolean;
};
type Amostra = { id: string; url: string };
type Estado = { fase: "vazio" } | { fase: "enviando" } | { fase: "fila"; id: string; desde: number } | { fase: "pronto"; a: Analise } | { fase: "erro"; msg: string };

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

export function Workstation({ modeloPreliminar }: { modeloPreliminar: boolean }) {
  const [estado, setEstado] = useState<Estado>({ fase: "vazio" });
  const [amostras, setAmostras] = useState<Amostra[]>([]);
  const [opacidade, setOpacidade] = useState(40);
  const [paleta, setPaleta] = useState<Paleta>("viridis");
  const [contorno, setContorno] = useState(false);
  const [lado, setLado] = useState(false);
  const [vista, setVista] = useState({ z: 1, x: 0, y: 0 });
  const [arrastando, setArrastando] = useState(false);
  const [decorrido, setDecorrido] = useState(0);
  const atual = useRef<string | null>(null);
  const arraste = useRef<{ x: number; y: number } | null>(null);
  const cinza = useRef<ImageData | null>(null);
  const telas = useRef<(HTMLCanvasElement | null)[]>([]);
  const arquivo = useRef<HTMLInputElement>(null);

  const carregar = useCallback(async (id: string) => {
    const r = await fetch(`/api/analyses/${id}`);
    if (!r.ok) { setEstado({ fase: "erro", msg: "Análise não encontrada." }); return; }
    const a = (await r.json()) as Analise;
    if (atual.current !== id) return;
    if (a.status === "DONE") setEstado({ fase: "pronto", a });
    else if (a.status === "FAILED") setEstado({ fase: "erro", msg: "Não foi possível analisar esta imagem. Tente enviar de novo." });
  }, []);

  // SSE: um fluxo por usuário; assina antes de consultar o estado para não perder evento
  useEffect(() => {
    const es = new EventSource("/api/events");
    es.addEventListener("analysis", (e) => {
      const d = JSON.parse((e as MessageEvent<string>).data) as { analysisId: string };
      if (d.analysisId === atual.current) void carregar(d.analysisId);
    });
    es.addEventListener("ready", () => { if (atual.current) void carregar(atual.current); });
    return () => es.close();
  }, [carregar]);

  useEffect(() => {
    fetch("/api/gallery").then((r) => r.json()).then((j: { items: Amostra[] }) => setAmostras(j.items)).catch(() => undefined);
    const id = new URLSearchParams(location.search).get("analise");
    if (id) { atual.current = id; setEstado({ fase: "fila", id, desde: Date.now() }); void carregar(id); }
  }, [carregar]);

  useEffect(() => {
    if (estado.fase !== "fila") return;
    const t = setInterval(() => setDecorrido(Date.now() - estado.desde), 100);
    return () => clearInterval(t);
  }, [estado]);

  const enviar = useCallback(async (dados: FormData) => {
    setEstado({ fase: "enviando" });
    setVista({ z: 1, x: 0, y: 0 });
    const inicio = Date.now();
    const r = await fetch("/api/analyses", { method: "POST", body: dados }).catch(() => null);
    const j = (await r?.json().catch(() => null)) as { analysisId?: string; status?: string; result?: Analise; error?: { code: string; message: string } } | null;
    if (!r || !r.ok || !j?.analysisId) {
      if (j?.error?.code === "TERMS_REQUIRED") { location.href = "/termo"; return; }
      setEstado({ fase: "erro", msg: j?.error?.message ?? "Falha de conexão. Tente de novo." });
      return;
    }
    atual.current = j.analysisId;
    history.replaceState(null, "", `/?analise=${j.analysisId}`);
    if (j.status === "DONE" && j.result) setEstado({ fase: "pronto", a: j.result });
    else { setEstado({ fase: "fila", id: j.analysisId, desde: inicio }); void carregar(j.analysisId); }
  }, [carregar]);

  const enviarArquivo = (f: File | undefined | null) => {
    if (!f) return;
    if (!["image/png", "image/jpeg"].includes(f.type)) { setEstado({ fase: "erro", msg: "Formato não aceito. Envie PNG ou JPEG." }); return; }
    if (f.size > 5 * 1024 * 1024) { setEstado({ fase: "erro", msg: "A imagem passa de 5 MB." }); return; }
    const d = new FormData(); d.append("imagem", f); void enviar(d);
  };
  const enviarAmostra = (id: string) => { const d = new FormData(); d.append("amostra", id); void enviar(d); };

  useEffect(() => {
    const colar = (e: ClipboardEvent) => enviarArquivo(Array.from(e.clipboardData?.files ?? [])[0]);
    window.addEventListener("paste", colar);
    return () => window.removeEventListener("paste", colar);
  });

  // Carrega o mapa (PNG em tons de cinza) e pinta com a paleta escolhida, no próprio navegador
  const a = estado.fase === "pronto" ? estado.a : null;
  useEffect(() => {
    cinza.current = null;
    if (!a?.hasHeatmap) return;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
      const ctx = c.getContext("2d"); if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      cinza.current = ctx.getImageData(0, 0, c.width, c.height);
      pintar();
    };
    img.src = `/api/analyses/${a.id}/heatmap`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a?.id]);

  const pintar = useCallback(() => {
    const g = cinza.current; if (!g) return;
    telas.current.forEach((c, i) => {
      if (!c) return;
      const ctx = c.getContext("2d"); if (!ctx) return;
      c.width = g.width; c.height = g.height;
      ctx.putImageData(new ImageData(colorir(g.data, paleta, i === 0 && contorno), g.width, g.height), 0, 0);
    });
  }, [paleta, contorno]);
  useEffect(() => { pintar(); }, [pintar, lado]);

  // Zoom e deslocamento compartilhados pelas duas vistas (lado a lado sincronizado)
  const zoom = (fator: number) => setVista((v) => { const z = Math.min(8, Math.max(1, v.z * fator)); return z === 1 ? { z, x: 0, y: 0 } : { ...v, z }; });
  const mover = (dx: number, dy: number) => setVista((v) => (v.z === 1 ? v : { ...v, x: v.x + dx, y: v.y + dy }));
  const tecla = (e: KeyboardEvent<HTMLDivElement>) => {
    const m: Record<string, () => void> = {
      "+": () => zoom(1.25), "=": () => zoom(1.25), "-": () => zoom(0.8), "0": () => setVista({ z: 1, x: 0, y: 0 }),
      ArrowLeft: () => mover(20, 0), ArrowRight: () => mover(-20, 0), ArrowUp: () => mover(0, 20), ArrowDown: () => mover(0, -20),
      s: () => setLado((l) => !l), S: () => setLado((l) => !l),
    };
    const f = m[e.key]; if (f) { e.preventDefault(); f(); }
  };
  const inicioArraste = (e: RPointerEvent<HTMLDivElement>) => { arraste.current = { x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId); };
  const duranteArraste = (e: RPointerEvent<HTMLDivElement>) => {
    const p = arraste.current; if (!p) return;
    mover(e.clientX - p.x, e.clientY - p.y); arraste.current = { x: e.clientX, y: e.clientY };
  };

  const ordenadas = a?.probabilities ? CLASSES.map((c) => [c, a.probabilities?.[c] ?? 0] as const).sort((x, y) => y[1] - x[1]) : [];
  const [top1, top2] = ordenadas;
  const baixa = top1 !== undefined && top1[1] < LIMIAR_BAIXA_CONFIANCA;
  const ood = a?.outOfDistribution ?? false;
  const transform = `translate(${vista.x}px, ${vista.y}px) scale(${vista.z})`;

  const viewer = (i: number, rotulo: string, comMapa: boolean) => (
    <div className="viewer" key={i} tabIndex={0} role="img" aria-label={`${rotulo}. Use + e − para zoom, setas para mover, 0 para recentralizar, S para lado a lado.`}
      onKeyDown={tecla} onWheel={(e) => zoom(e.deltaY < 0 ? 1.15 : 0.87)}
      onPointerDown={inicioArraste} onPointerMove={duranteArraste} onPointerUp={() => (arraste.current = null)}>
      {a ? (
        <div className={`stage${vista.z >= 4 ? " px" : ""}`} style={{ transform }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/analyses/${a.id}/image`} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", imageRendering: vista.z >= 4 ? "pixelated" : "auto" }} />
          {comMapa && !ood && <canvas ref={(c) => { telas.current[i] = c; }} style={{ opacity: opacidade / 100 }} />}
        </div>
      ) : (
        <div className="empty">{estado.fase === "enviando" || estado.fase === "fila" ? <div className="skeleton" style={{ position: "absolute", inset: 0 }} /> : "Envie um recorte ou escolha uma amostra da galeria."}</div>
      )}
      <span className="vlabel">{rotulo}</span>
    </div>
  );

  return (
    <div className="grid">
      <aside className="panel">
        <h2>Enviar imagem</h2>
        <label className={`drop${arrastando ? " over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setArrastando(true); }} onDragLeave={() => setArrastando(false)}
          onDrop={(e) => { e.preventDefault(); setArrastando(false); enviarArquivo(e.dataTransfer.files[0]); }}>
          <strong>Arraste um recorte H&amp;E</strong><br />ou clique para escolher · Ctrl+V cola<br /><small>PNG ou JPEG, até 5 MB, mínimo 224×224 px</small>
          <input ref={arquivo} type="file" accept="image/png,image/jpeg" className="sr-only" onChange={(e) => { enviarArquivo(e.target.files?.[0]); e.target.value = ""; }} />
        </label>
        <small className="aviso-envio">Não envie imagens com dados de paciente (nome, etiqueta, prontuário).</small>
        <h2 style={{ marginTop: 16 }}>Galeria de amostras</h2>
        {amostras.length === 0 ? <p className="hint">Galeria indisponível.</p> : (
          <div className="thumbs">
            {amostras.map((s, i) => (
              <button key={s.id} type="button" className="thumb" onClick={() => enviarAmostra(s.id)} aria-label={`Analisar amostra ${i + 1}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.url} alt="" style={{ display: "block", width: "100%" }} /><span>#{i + 1}</span>
              </button>
            ))}
          </div>
        )}
        <p className="hint">Amostras do CRC-VAL-HE-7K (Kather et al., 2018), CC BY 4.0. O rótulo aparece depois do resultado.</p>
      </aside>

      <section className="panel" aria-label="Visualizador">
        <div className="toolbar">
          <div className="seg" role="group" aria-label="Modo de visualização">
            <button type="button" aria-pressed={!lado} onClick={() => setLado(false)}>Sobreposição</button>
            <button type="button" aria-pressed={lado} onClick={() => setLado(true)}>Lado a lado</button>
          </div>
          <button type="button" className="btn ghost zoom-btn" onClick={() => zoom(0.8)} aria-label="Diminuir zoom">−</button>
          <span className="mono" aria-live="polite">{Math.round(vista.z * 100)}%</span>
          <button type="button" className="btn ghost zoom-btn" onClick={() => zoom(1.25)} aria-label="Aumentar zoom">+</button>
          <button type="button" className="btn ghost" onClick={() => setVista({ z: 1, x: 0, y: 0 })}>Recentralizar</button>
        </div>
        <div className={`viewers${lado ? " sbs" : ""}`}>
          {lado ? [viewer(0, "Recorte", false), viewer(1, "Recorte + mapa", true)] : viewer(0, "Recorte + mapa", true)}
        </div>
        <div className="slider">
          <label htmlFor="op">Intensidade do mapa</label>
          <input id="op" type="range" min={0} max={100} value={opacidade} onChange={(e) => setOpacidade(Number(e.target.value))} disabled={ood} />
          <span className="mono">{opacidade}%</span>
        </div>
        <div className="toolbar" style={{ marginTop: 8 }}>
          <label>Paleta <select value={paleta} onChange={(e) => setPaleta(e.target.value as Paleta)}><option value="viridis">viridis</option><option value="turbo">turbo</option></select></label>
          <label><input type="checkbox" checked={contorno} onChange={(e) => setContorno(e.target.checked)} /> Só contorno</label>
        </div>
        <div className="legenda"><span>menor</span><i style={{ background: gradiente(paleta) }} /><span>maior influência na sugestão</span></div>
        <p className="hint">O mapa mostra as regiões que mais influenciaram o modelo, não a localização de lesão. Recorte de 224×224 px ≈ 112 µm de lado (0,5 µm/px).</p>
      </section>

      <aside className="panel" aria-live="polite">
        <h2>Resultado</h2>
        {estado.fase === "vazio" && <p className="hint">Nenhuma análise ainda. Comece pela galeria se for o primeiro acesso.</p>}
        {(estado.fase === "enviando" || estado.fase === "fila") && (
          <div role="status"><p>{estado.fase === "enviando" ? "Enviando…" : "Analisando…"} <span className="mono">{(decorrido / 1000).toFixed(1)} s</span></p><div className="skeleton" style={{ height: 120, borderRadius: 6 }} /></div>
        )}
        {estado.fase === "erro" && (
          <div className="alert err" role="alert"><span>{estado.msg}</span> <button type="button" className="btn ghost" onClick={() => arquivo.current?.click()}>Escolher outra</button></div>
        )}
        {a && top1 && (
          <>
            {ood ? (
              <div className="alert" role="alert">Esta imagem parece diferente das usadas no treino (pouco tecido, outra coloração ou ampliação). A sugestão abaixo não é confiável e o mapa foi ocultado.</div>
            ) : null}
            <p style={{ margin: "0 0 2px", color: "var(--muted)", fontSize: 12 }}>Padrão tecidual sugerido</p>
            <div className="result-top"><span className="cls">{top1[0]}</span><span className="name">{INFO[top1[0]].nome}</span><span className="mono">{pct(top1[1])}</span></div>
            {baixa && top2 && (
              <div className="alert" role="note">
                <div>Confiança baixa. <strong>Segunda hipótese: {top2[0]}</strong> ({pct(top2[1])}).<br /><small>{diferenca(top1[0] as Classe, top2[0] as Classe)}</small></div>
              </div>
            )}
            <ul className="bars">
              {ordenadas.map(([c, v], i) => (
                <li key={c} className={`bar${i === 0 ? " top" : ""}`}>
                  <span className="lab" tabIndex={0}>{c}</span>
                  <div className="track"><div className="fill" style={{ transform: `scaleX(${v})` }} /></div>
                  <span className="pct">{pct(v)}</span>
                  <div className="tip" role="tooltip"><b>{INFO[c].nome}</b><br />{INFO[c].criterios}<br /><em>Atenção:</em> {INFO[c].atencao}</div>
                </li>
              ))}
            </ul>
            {a.groundTruth && ehClasse(a.groundTruth) && (
              <p className={a.groundTruth === top1[0] ? "ok" : "bad"} style={{ marginTop: 10 }}>
                Rótulo da amostra: <strong>{a.groundTruth}</strong> ({INFO[a.groundTruth].nome}){a.groundTruth === top1[0] ? " · coincide com a sugestão" : " · diferente da sugestão"}
              </p>
            )}
            <div className="meta">
              <span>Modelo</span><b className="mono">{a.model.name} {a.model.version}</b>
              <span>Hash</span><b className="mono" title={a.model.sha256}>{a.model.sha256.slice(0, 12)}…</b>
              <span>Tempo</span><b className="mono">{a.e2eMs ?? "–"} ms{a.workerMs ? ` (modelo ${a.workerMs} ms)` : ""}</b>
              <span>Cache</span><b>{a.cacheHit ? "sim" : "não"}</b>
            </div>
            {modeloPreliminar && <div className="alert" role="note" style={{ marginTop: 10 }}>Modelo de demonstração sem treino: as sugestões são aleatórias e servem só para testar o fluxo.</div>}
          </>
        )}
      </aside>
    </div>
  );
}
