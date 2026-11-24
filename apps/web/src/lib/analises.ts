import "server-only";
import { db } from "./infra";

export type Analise = {
  id: string; status: "QUEUED" | "PROCESSING" | "DONE" | "FAILED"; predictedClass: string | null;
  probabilities: Record<string, number> | null; outOfDistribution: boolean; cacheHit: boolean;
  workerMs: number | null; e2eMs: number | null; error: string | null; createdAt: string; completedAt: string | null;
  model: { name: string; version: string; sha256: string }; groundTruth: string | null; hasHeatmap: boolean;
};

const SELECT = `
  SELECT a.id, a.status, a.predicted_class, a.probabilities, a.out_of_distribution, a.cache_hit, a.worker_ms, a.e2e_ms,
         a.error, a.created_at, a.completed_at, a.heatmap_storage_key IS NOT NULL AS has_heatmap,
         m.name AS m_name, m.version AS m_version, m.file_sha256 AS m_sha, i.ground_truth_class
    FROM analyses a JOIN model_versions m ON m.id = a.model_version_id JOIN images i ON i.id = a.image_id`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapear = (r: any): Analise => ({
  id: r.id, status: r.status, predictedClass: r.predicted_class, probabilities: r.probabilities,
  outOfDistribution: r.out_of_distribution, cacheHit: r.cache_hit, workerMs: r.worker_ms, e2eMs: r.e2e_ms,
  // RN07: o rótulo da galeria só aparece depois que há resultado
  groundTruth: r.status === "DONE" ? r.ground_truth_class : null,
  error: r.error, createdAt: r.created_at.toISOString(), completedAt: r.completed_at?.toISOString() ?? null,
  model: { name: r.m_name, version: r.m_version, sha256: r.m_sha }, hasHeatmap: r.has_heatmap,
});

/** Análise do próprio usuário (nunca de outro: RNF04). */
export async function buscarAnalise(id: string, userId: string): Promise<Analise | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const r = await db().query(`${SELECT} WHERE a.id = $1 AND a.user_id = $2`, [id, userId]);
  return r.rows[0] ? mapear(r.rows[0]) : null;
}

export async function listarAnalises(userId: string, f: { classe?: string; pagina: number; porPagina: number }): Promise<{ itens: Analise[]; total: number }> {
  const params: unknown[] = [userId];
  let filtro = "";
  if (f.classe) { params.push(f.classe); filtro = ` AND a.predicted_class = $${params.length}`; }
  const total = await db().query(`SELECT count(*)::int AS n FROM analyses a WHERE a.user_id = $1${filtro}`, params);
  params.push(f.porPagina, (f.pagina - 1) * f.porPagina);
  const r = await db().query(`${SELECT} WHERE a.user_id = $1${filtro} ORDER BY a.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
  return { itens: r.rows.map(mapear), total: total.rows[0].n };
}
