import type { Metadata } from "next";
import type { ReactNode } from "react";
import { EthicsBanner } from "@/components/EthicsBanner";
import { Nav } from "@/components/Nav";
import { usuarioAtual } from "@/lib/sessao";
import "./globals.css";

export const metadata: Metadata = { title: "HistoLente", description: "Estudo explicável de padrões histológicos do câncer colorretal" };
export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: ReactNode }) {
  const u = await usuarioAtual().catch(() => null);
  return (
    <html lang="pt-BR">
      <body>
        <EthicsBanner />
        <Nav nome={u?.nome ?? null} />
        <main>{children}</main>
      </body>
    </html>
  );
}
