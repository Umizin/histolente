"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AceitarTermo() {
  const router = useRouter();
  const [marcado, setMarcado] = useState(false);
  const [erro, setErro] = useState(false);
  const aceitar = async () => {
    const r = await fetch("/api/consent", { method: "POST" }).catch(() => null);
    if (!r?.ok) { setErro(true); return; }
    router.push("/");
    router.refresh();
  };
  return (
    <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
      <label style={{ display: "flex", gap: 8 }}><input type="checkbox" checked={marcado} onChange={(e) => setMarcado(e.target.checked)} /> Li e concordo com os termos acima.</label>
      {erro && <div className="alert err" role="alert">Não foi possível registrar o aceite. Tente de novo.</div>}
      <button className="btn" disabled={!marcado} onClick={aceitar} style={{ justifySelf: "start" }}>Aceitar e continuar</button>
    </div>
  );
}
