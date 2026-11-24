import { CLASSES, INFO } from "@/lib/classes";
import { modeloAtivo } from "@/lib/modelo";

export default async function Sobre() {
  const m = await modeloAtivo().catch(() => null);
  return (
    <article className="texto panel">
      <h1>Sobre o HistoLente</h1>
      <p>Ferramenta educacional desenvolvida como Trabalho de Conclusão de Curso em Engenharia de Software (Universidade de Vassouras, campus Maricá, 2026). Ela sugere a qual de nove padrões teciduais um recorte de lâmina H&amp;E de câncer colorretal se parece e mostra, com o Grad-CAM, as regiões que mais influenciaram a sugestão.</p>
      <p><strong>Não é um sistema de diagnóstico.</strong> A interpretação de lâminas e a decisão clínica são do médico patologista (Res. CFM nº 2.454/2026).</p>
      <h2 style={{ fontSize: 15 }}>Modelo em uso</h2>
      {m ? <p className="mono">{m.nome} · versão {m.versao} · {m.backbone} · SHA-256 {m.sha256.slice(0, 16)}…{m.preliminar ? " · demonstração sem treino" : ""}</p> : <p>Indisponível.</p>}
      <h2 style={{ fontSize: 15 }}>Classes</h2>
      <ul>{CLASSES.map((c) => <li key={c}><strong>{c}</strong> · {INFO[c].nome}</li>)}</ul>
      <h2 style={{ fontSize: 15 }}>Dados</h2>
      <p>Treino com o NCT-CRC-HE-100K e teste com o CRC-VAL-HE-7K (KATHER et al., 2018), licença CC BY 4.0. Explicabilidade por Grad-CAM (SELVARAJU et al., 2017).</p>
      <p className="hint">Código: github.com/Umizin/histolente</p>
    </article>
  );
}
