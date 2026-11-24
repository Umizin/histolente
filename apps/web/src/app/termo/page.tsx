import { redirect } from "next/navigation";
import { usuarioAtual, VERSAO_TERMO } from "@/lib/sessao";
import { AceitarTermo } from "./AceitarTermo";

export default async function Termo() {
  const u = await usuarioAtual();
  if (!u) redirect("/login");
  return (
    <article className="texto panel">
      <h1>Termo de uso (versão {VERSAO_TERMO})</h1>
      <ul>
        <li>O HistoLente é uma ferramenta <strong>educacional</strong> para o estudo de padrões histológicos do câncer colorretal. Ele não emite laudo e não substitui o exame anatomopatológico; a decisão clínica é sempre do médico (Res. CFM nº 2.454/2026).</li>
        <li>Envie apenas recortes de lâmina <strong>sem qualquer dado de paciente</strong> (nome, prontuário, etiqueta ou código da lâmina). Os metadados do arquivo são descartados no envio.</li>
        <li>O sistema guarda seu nome, e-mail e as análises que você fizer, para montar o seu histórico. Esses dados não são compartilhados.</li>
        <li>As sugestões do modelo podem estar erradas, sobretudo em imagens diferentes das usadas no treino (outras colorações, ampliações ou órgãos).</li>
        <li>O modelo foi treinado com o conjunto público NCT-CRC-HE-100K (Kather et al., 2018), licença CC BY 4.0.</li>
      </ul>
      {u.termoAceito ? <p className="hint">Você já aceitou esta versão do termo.</p> : <AceitarTermo />}
    </article>
  );
}
