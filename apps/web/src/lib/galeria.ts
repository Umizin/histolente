import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ehClasse, type Classe } from "./classes";

export type Conjunto = "galeria" | "quiz";
export type Amostra = { id: string; arquivo: string; classe: Classe; conjunto: Conjunto };

const MANIFESTOS: Record<Conjunto, string> = { galeria: "manifest.json", quiz: "quiz.json" };
const cache: Partial<Record<Conjunto, Amostra[]>> = {};

/** Amostras do CRC-VAL-HE-7K (Kather et al., 2018; CC BY 4.0). Os manifestos ficam em galeria/ (fora de public/),
 *  então o rótulo nunca é servido ao navegador. */
export async function amostras(conjunto: Conjunto = "galeria"): Promise<Amostra[]> {
  const pronto = cache[conjunto];
  if (pronto) return pronto;
  let lista: Amostra[] = [];
  try {
    const bruto = JSON.parse(await readFile(path.join(process.cwd(), "galeria", MANIFESTOS[conjunto]), "utf-8")) as unknown;
    lista = (Array.isArray(bruto) ? bruto : []).flatMap((a: { id?: unknown; arquivo?: unknown; classe?: unknown }) =>
      typeof a.id === "string" && typeof a.arquivo === "string" && /^[\w.-]+\.(png|jpg)$/.test(a.arquivo) && ehClasse(a.classe)
        ? [{ id: a.id, arquivo: a.arquivo, classe: a.classe, conjunto }] : []);
  } catch {
    lista = [];
  }
  cache[conjunto] = lista;
  return lista;
}

/** Procura nos dois conjuntos (a análise de uma imagem do quiz usa o mesmo caminho da galeria). */
export async function buscarAmostra(id: string): Promise<Amostra | undefined> {
  return (await amostras("galeria")).find((a) => a.id === id) ?? (await amostras("quiz")).find((a) => a.id === id);
}

export const urlAmostra = (a: Amostra): string => `/${a.conjunto}/${a.arquivo}`;

export const lerAmostra = (a: Amostra): Promise<Buffer> => readFile(path.join(process.cwd(), "public", a.conjunto, a.arquivo));
