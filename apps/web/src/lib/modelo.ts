import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { env } from "./env";
import { db } from "./infra";

export type VersaoModelo = { id: string; nome: string; versao: string; sha256: string; backbone: string; preliminar: boolean; metricas: unknown };

const g = globalThis as unknown as { _modelo?: Promise<VersaoModelo> };

/**
 * Versão do modelo em uso, lida do model card montado em modo leitura (a web nunca carrega o .pt).
 * Sem model card, registra a versão de pesos aleatórios, a mesma que o serviço de inferência usa.
 */
async function carregar(): Promise<VersaoModelo> {
  let card: { nome: string; versao: string; sha256: string; backbone: string; metricas_teste?: unknown } | null = null;
  try {
    const arqs = (await readdir(env().MODEL_DIR)).filter((a) => a.endsWith(".model_card.json")).sort();
    const ultimo = arqs.at(-1);
    if (ultimo) card = JSON.parse(await readFile(path.join(env().MODEL_DIR, ultimo), "utf-8"));
  } catch { /* pasta ausente: segue sem modelo */ }
  const m = card ?? { nome: "resnet18-aleatorio", versao: "0.0.0", sha256: "0".repeat(64), backbone: "resnet18", metricas_teste: null };
  const cli = await db().connect();
  try {
    await cli.query("BEGIN");
    await cli.query("UPDATE model_versions SET active = false WHERE active AND version <> $1", [m.versao]);
    const r = await cli.query(
      `INSERT INTO model_versions (name, version, file_sha256, backbone, metrics, active)
       VALUES ($1, $2, $3, $4, $5, true)
       ON CONFLICT (version) DO UPDATE SET active = true, metrics = EXCLUDED.metrics
       RETURNING id`, [m.nome, m.versao, m.sha256, m.backbone, JSON.stringify(m.metricas_teste ?? null)]);
    await cli.query("COMMIT");
    return { id: r.rows[0].id, nome: m.nome, versao: m.versao, sha256: m.sha256, backbone: m.backbone, preliminar: card === null, metricas: m.metricas_teste ?? null };
  } catch (e) {
    await cli.query("ROLLBACK");
    throw e;
  } finally {
    cli.release();
  }
}

export function modeloAtivo(): Promise<VersaoModelo> {
  g._modelo ??= carregar().catch((e) => { g._modelo = undefined; throw e; });
  return g._modelo;
}

/** RN05: a chave inclui a versão do modelo e a classe-alvo do Grad-CAM. */
export const chaveCache = (hash: string, versao: string, alvo = "pred"): string => `cache:sha256:${hash}:${versao}:${alvo}`;
