import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ehClasse, type Classe } from "./classes";

export type Amostra = { id: string; arquivo: string; classe: Classe };

let cache: Amostra[] | null = null;

/** Amostras do CRC-VAL-HE-7K (Kather et al., 2018; CC BY 4.0) listadas em galeria/manifest.json (fora de public/: o rótulo não é servido). */
export async function amostras(): Promise<Amostra[]> {
  if (cache) return cache;
  try {
    const bruto = JSON.parse(await readFile(path.join(process.cwd(), "galeria", "manifest.json"), "utf-8")) as unknown;
    const lista = Array.isArray(bruto) ? bruto : [];
    cache = lista.flatMap((a: { id?: unknown; arquivo?: unknown; classe?: unknown }) =>
      typeof a.id === "string" && typeof a.arquivo === "string" && /^[\w.-]+\.(png|jpg)$/.test(a.arquivo) && ehClasse(a.classe)
        ? [{ id: a.id, arquivo: a.arquivo, classe: a.classe }] : []);
  } catch {
    cache = [];
  }
  return cache;
}

export const lerAmostra = (a: Amostra): Promise<Buffer> => readFile(path.join(process.cwd(), "public", "galeria", a.arquivo));
