import "server-only";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { env } from "./env";

/** Arquivos ficam em volume compartilhado, nunca em bytea (chave = caminho relativo). */
const caminho = (chave: string): string => {
  if (!/^(images|heatmaps)\/[0-9a-f-]{36,64}\.png$/.test(chave)) throw new Error("chave de armazenamento inválida");
  return path.join(env().STORAGE_DIR, chave);
};

export async function salvar(chave: string, dados: Buffer): Promise<void> {
  const p = caminho(chave);
  try { await access(p); return; } catch { /* ainda não existe */ }
  await mkdir(path.dirname(p), { recursive: true });
  await writeFile(p, dados);
}

export const ler = (chave: string): Promise<Buffer> => readFile(caminho(chave));
