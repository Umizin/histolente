"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CLASSES, INFO, type Classe } from "@/lib/classes";

type Amostra = { id: string; url: string; total: number };
type Correcao = { correta: boolean; classe: Classe; nome: string; criterios: string; atencao: string; explicacao: string | null };

/** HU13 — modo quiz: o estudante classifica antes de ver qualquer sugestão do modelo. */
export function Quiz() {
  const router = useRouter();
  const [amostra, setAmostra] = useState<Amostra | null>(null);
  const [escolha, setEscolha] = useState<Classe | null>(null);
  const [correcao, setCorrecao] = useState<Correcao | null>(null);
  const [placar, setPlacar] = useState({ acertos: 0, total: 0 });
  const [erro, setErro] = useState<string | null>(null);
  const [abrindo, setAbrindo] = useState(false);
  const vistos = useRef<string[]>([]);
  const proximoBtn = useRef<HTMLButtonElement>(null);

  const proxima = useCallback(async () => {
    setErro(null); setEscolha(null); setCorrecao(null);
    const r = await fetch(`/api/quiz?evitar=${vistos.current.join(",")}`);
    if (!r.ok) { setErro("Não foi possível carregar uma amostra. Tente de novo."); return; }
    const a = (await r.json()) as Amostra;
    vistos.current = [a.id, ...vistos.current].slice(0, Math.min(20, Math.max(0, a.total - 5)));
    setAmostra(a);
  }, []);

  useEffect(() => { void proxima(); }, [proxima]);

  const responder = useCallback(async (c: Classe) => {
    if (!amostra || escolha) return;
    setEscolha(c);
    const r = await fetch("/api/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: amostra.id, resposta: c }) });
    if (!r.ok) { setEscolha(null); setErro("Não foi possível conferir a resposta. Tente de novo."); return; }
    const k = (await r.json()) as Correcao;
    setCorrecao(k);
    setPlacar((p) => ({ acertos: p.acertos + (k.correta ? 1 : 0), total: p.total + 1 }));
  }, [amostra, escolha]);

  useEffect(() => { if (correcao) proximoBtn.current?.focus(); }, [correcao]);

  // teclas 1–9 respondem; Enter passa para a próxima depois da correção
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.ctrlKey || e.metaKey || e.altKey) return;
      const n = Number(e.key);
      if (!correcao && n >= 1 && n <= 9) { e.preventDefault(); void responder(CLASSES[n - 1]!); }
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [correcao, responder]);

  const verAnalise = async () => {
    if (!amostra) return;
    setAbrindo(true);
    const f = new FormData();
    f.set("amostra", amostra.id);
    const r = await fetch("/api/analyses", { method: "POST", body: f });
    const j = (await r.json().catch(() => null)) as { analysisId?: string; error?: { message: string } } | null;
    if (r.ok && j?.analysisId) router.push(`/?analise=${j.analysisId}`);
    else { setAbrindo(false); setErro(j?.error?.message ?? "Não foi possível abrir a análise."); }
  };

  return (
    <div className="quiz">
      <section className="panel quiz-img" aria-label="Amostra">
        {amostra ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={amostra.url} alt="Recorte de lâmina H&E de 224 × 224 px para classificar" width={224} height={224} />
        ) : <div className="skeleton" style={{ aspectRatio: "1", borderRadius: 6 }} />}
        <p className="hint">Recorte de 224 × 224 px do CRC-VAL-HE-7K (Kather et al., 2018), ampliado na tela.</p>
      </section>

      <section className="panel" aria-label="Pergunta">
        <div className="quiz-topo">
          <h2 style={{ margin: 0 }}>Que tecido é este?</h2>
          <span className="mono" aria-live="polite">Acertos: {placar.acertos} de {placar.total}</span>
        </div>
        <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>Escolha uma classe (ou tecle de 1 a 9). A resposta e a sugestão do modelo só aparecem depois.</p>

        <div className="opcoes" role="group" aria-label="Classes">
          {CLASSES.map((c, i) => {
            const estado = correcao ? (c === correcao.classe ? "certa" : c === escolha ? "errada" : "") : c === escolha ? "marcada" : "";
            return (
              <button key={c} type="button" className={`opcao ${estado}`} onClick={() => void responder(c)} disabled={!!escolha || !amostra}
                      aria-pressed={c === escolha}>
                <span className="mono">{i + 1} · {c}</span>
                <small>{INFO[c].nome}</small>
              </button>
            );
          })}
        </div>

        {erro && <div className="alert err" role="alert">{erro}</div>}

        {correcao && (
          <div className="correcao" aria-live="polite">
            <p className={correcao.correta ? "ok" : "bad"} style={{ fontWeight: 600, margin: "0 0 6px" }}>
              {correcao.correta ? "Acertou." : "Não foi dessa vez."} Rótulo de referência: <span className="mono">{correcao.classe}</span> · {correcao.nome}
            </p>
            {!correcao.correta && correcao.explicacao && escolha && (
              <p style={{ margin: "0 0 6px" }}><strong>Por que não é {escolha}?</strong> {correcao.explicacao}</p>
            )}
            <p style={{ margin: "0 0 6px" }}><strong>Critérios de {correcao.classe}:</strong> {correcao.criterios}</p>
            <p className="hint" style={{ marginTop: 0 }}><em>Atenção:</em> {correcao.atencao}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button ref={proximoBtn} type="button" className="btn" onClick={() => void proxima()}>Próxima amostra</button>
              <button type="button" className="btn ghost" onClick={() => void verAnalise()} disabled={abrindo}>
                {abrindo ? "Abrindo…" : "Ver análise do modelo"}
              </button>
            </div>
          </div>
        )}
        {placar.total > 0 && !correcao && (
          <p className="hint"><button type="button" className="linkbtn" onClick={() => setPlacar({ acertos: 0, total: 0 })}>Zerar placar</button></p>
        )}
      </section>
    </div>
  );
}
