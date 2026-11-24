"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [["/", "Analisar"], ["/historico", "Histórico"], ["/sobre", "Sobre"]] as const;

export function Nav({ nome }: { nome: string | null }) {
  const caminho = usePathname();
  const router = useRouter();
  const sair = async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); router.refresh(); };
  return (
    <header>
      <div className="brand">Histo<span>Lente</span> <small style={{ color: "var(--muted)", fontWeight: 400 }}>· estudo de padrões histológicos do câncer colorretal</small></div>
      {nome && (
        <nav aria-label="Principal">
          {LINKS.map(([href, rotulo]) => <Link key={href} href={href} aria-current={caminho === href ? "page" : undefined}>{rotulo}</Link>)}
        </nav>
      )}
      {nome && <div className="user"><span>{nome}</span><button type="button" className="btn ghost" onClick={sair}>Sair</button></div>}
    </header>
  );
}
