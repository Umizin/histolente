"use client";
import { useEffect, useState } from "react";
import { CLASSES, INFO, ehClasse } from "@/lib/classes";
import { pct } from "@/lib/formato";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

type Item = { id: string; status: string; predictedClass: string | null; probabilities: Record<string, number> | null; createdAt: string; cacheHit: boolean; outOfDistribution: boolean; model: { version: string } };

export function Historico() {
  const [classe, setClasse] = useState("");
  const [pagina, setPagina] = useState(1);
  const [dados, setDados] = useState<{ items: Item[]; total: number } | null>(null);

  useEffect(() => {
    const q = new URLSearchParams({ pagina: String(pagina), ...(classe ? { classe } : {}) });
    fetch(`/api/analyses?${q}`).then((r) => r.json()).then(setDados).catch(() => setDados({ items: [], total: 0 }));
  }, [classe, pagina]);

  const paginas = Math.max(1, Math.ceil((dados?.total ?? 0) / 20));
  const csv = () => {
    const linhas = [["id", "data", "status", "classe_sugerida", "confianca", "modelo", "cache", "fora_do_padrao"],
      ...(dados?.items ?? []).map((i) => [i.id, i.createdAt, i.status, i.predictedClass ?? "", i.predictedClass ? String(i.probabilities?.[i.predictedClass] ?? "") : "", i.model.version, String(i.cacheHit), String(i.outOfDistribution)])];
    const url = URL.createObjectURL(new Blob([linhas.map((l) => l.join(";")).join("\n")], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "historico-histolente.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <section className="largura">
      <h1 className="pagina-titulo">Histórico de análises</h1>
      <div className="panel">
      <div className="filtros">
        <label>Classe sugerida <select value={classe} onChange={(e) => { setClasse(e.target.value); setPagina(1); }}>
          <option value="">todas</option>{CLASSES.map((c) => <option key={c} value={c}>{c}, {INFO[c].nome.toLowerCase()}</option>)}
        </select></label>
        <button type="button" className="btn ghost" onClick={csv} disabled={!dados?.items.length}><Download className="ico" aria-hidden="true" />Exportar CSV desta página</button>
      </div>
      {!dados ? <div className="skeleton" style={{ height: 120 }} /> : dados.items.length === 0 ? <p className="hint">Nenhuma análise encontrada. As análises que você fizer aparecem aqui.</p> : (
        <table>
          <thead><tr><th>Data</th><th>Sugestão</th><th>Confiança</th><th>Modelo</th><th>Situação</th></tr></thead>
          <tbody>
            {dados.items.map((i) => (
              <tr key={i.id} className="row" onClick={() => { location.href = `/?analise=${i.id}`; }}>
                <td className="num">{new Date(i.createdAt).toLocaleString("pt-BR")}</td>
                <td>{i.predictedClass && ehClasse(i.predictedClass) ? <><span className="chip">{i.predictedClass}</span>{INFO[i.predictedClass].nome}</> : "–"}</td>
                <td className="num">{i.predictedClass && i.probabilities ? pct(i.probabilities[i.predictedClass] ?? 0) : "–"}</td>
                <td className="num">{i.model.version}</td>
                <td>{({ QUEUED: "na fila", PROCESSING: "processando", DONE: i.outOfDistribution ? "concluída, fora do padrão" : "concluída", FAILED: "falhou" } as Record<string, string>)[i.status]}{i.cacheHit ? " (cache)" : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="paginas">
        <button type="button" className="btn ghost" disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)}><ChevronLeft className="ico" aria-hidden="true" />Anterior</button>
        <span>Página {pagina} de {paginas}</span>
        <button type="button" className="btn ghost" disabled={pagina >= paginas} onClick={() => setPagina(pagina + 1)}>Próxima<ChevronRight className="ico" aria-hidden="true" /></button>
      </div>
      </div>
    </section>
  );
}
