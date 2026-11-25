"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { History, Info, ListChecks, LogOut, Microscope, Moon, Sun } from "lucide-react";

const LINKS = [
  ["/", "Analisar", Microscope],
  ["/quiz", "Quiz", ListChecks],
  ["/historico", "Histórico", History],
  ["/sobre", "Sobre", Info],
] as const;

/** Marca: a lente objetiva vista de frente, com o anel de cor que identifica a ampliação. */
export function Marca() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="14.5" fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="10.5" fill="none" stroke="var(--accent)" strokeWidth="3" />
      <circle cx="16" cy="16" r="5" fill="currentColor" fillOpacity=".9" />
      <circle cx="14.2" cy="14.2" r="1.4" fill="var(--bg)" />
    </svg>
  );
}

function TrocaTema() {
  const [claro, setClaro] = useState(false);
  useEffect(() => { setClaro(document.documentElement.dataset.tema === "claro"); }, []);
  const trocar = () => {
    const novo = !claro;
    setClaro(novo);
    if (novo) document.documentElement.dataset.tema = "claro"; else delete document.documentElement.dataset.tema;
    try { localStorage.setItem("hl_tema", novo ? "claro" : "escuro"); } catch { /* sem armazenamento */ }
  };
  const rotulo = claro ? "Usar tema escuro" : "Usar tema claro (projetor)";
  return (
    <button type="button" className="icone" onClick={trocar} aria-label={rotulo} title={rotulo}>
      {claro ? <Moon className="ico" /> : <Sun className="ico" />}
    </button>
  );
}

export function Nav({ nome }: { nome: string | null }) {
  const caminho = usePathname();
  const router = useRouter();
  const sair = async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); router.refresh(); };
  return (
    <header>
      <Link href="/" className="brand"><Marca /><span>HistoLente</span><small>padrões histológicos do câncer colorretal</small></Link>
      {nome && (
        <nav aria-label="Principal">
          {LINKS.map(([href, rotulo, Icone]) => (
            <Link key={href} href={href} aria-current={caminho === href ? "page" : undefined}><Icone className="ico" aria-hidden="true" />{rotulo}</Link>
          ))}
        </nav>
      )}
      <div className="user">
        {nome && <span>{nome}</span>}
        <TrocaTema />
        {nome && <button type="button" className="icone" onClick={sair} aria-label="Sair" title="Sair"><LogOut className="ico" /></button>}
      </div>
    </header>
  );
}
