import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Source_Serif_4 } from "next/font/google";
import type { ReactNode } from "react";
import { EthicsBanner } from "@/components/EthicsBanner";
import { Nav } from "@/components/Nav";
import { usuarioAtual } from "@/lib/sessao";
import "./globals.css";

// Fontes servidas pelo próprio site (next/font): o navegador não faz requisição ao Google.
const sans = Instrument_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" });
const serif = Source_Serif_4({ subsets: ["latin", "latin-ext"], variable: "--font-serif", display: "swap", axes: ["opsz"] });

export const metadata: Metadata = { title: "HistoLente", description: "Estudo explicável de padrões histológicos do câncer colorretal" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, colorScheme: "dark light" };
export const dynamic = "force-dynamic";

// Aplica o tema salvo antes da primeira pintura (sem piscar)
const temaInicial = `try{var t=localStorage.getItem("hl_tema");if(t==="claro")document.documentElement.dataset.tema="claro"}catch(e){}`;

export default async function Layout({ children }: { children: ReactNode }) {
  const u = await usuarioAtual().catch(() => null);
  return (
    <html lang="pt-BR" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: temaInicial }} /></head>
      <body>
        <EthicsBanner />
        <Nav nome={u?.nome ?? null} />
        <main>{children}</main>
      </body>
    </html>
  );
}
