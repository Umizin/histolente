"use client";
import { useEffect, useState } from "react";

/** RF07: aviso fixo em todas as telas. Pode ser minimizado, nunca removido. */
export function EthicsBanner() {
  const [min, setMin] = useState(false);
  useEffect(() => { try { setMin(localStorage.getItem("hl_banner_min") === "1"); } catch { /* sem armazenamento */ } }, []);
  const alternar = () => {
    setMin((m) => { try { localStorage.setItem("hl_banner_min", m ? "0" : "1"); } catch { /* ignora */ } return !m; });
  };
  return (
    <div className={`banner${min ? " min" : ""}`} role="note" aria-label="Aviso sobre o uso da ferramenta" data-testid="ethics-banner">
      <span aria-hidden="true">⚠</span>
      <span className="txt">
        <span className="full">Ferramenta educacional para estudo de padrões histológicos. Não substitui o exame anatomopatológico nem o laudo. A decisão clínica é sempre do médico (Res. CFM nº 2.454/2026).</span>
        <span className="mini">Não substitui laudo · decisão do médico</span>
      </span>
      <button type="button" onClick={alternar} aria-expanded={!min}>{min ? "Mostrar aviso" : "Minimizar"}</button>
    </div>
  );
}
