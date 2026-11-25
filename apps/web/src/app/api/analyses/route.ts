import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { salvar } from "@/lib/armazenamento";
import { buscarAnalise, listarAnalises } from "@/lib/analises";
import { ehClasse } from "@/lib/classes";
import { buscarAmostra, lerAmostra } from "@/lib/galeria";
import { ehResposta, erro, exigirUsuario } from "@/lib/http";
import { ImagemInvalida, MAX_BYTES, prepararRecorte, sha256, tipoReal } from "@/lib/imagem";
import { db, publicarPedido, redis } from "@/lib/infra";
import { chaveCache, modeloAtivo } from "@/lib/modelo";

export const dynamic = "force-dynamic";
const LIMITE_POR_MINUTO = 30;

type Resultado = {
  predicted_class: string; probabilities: Record<string, number>; out_of_distribution: boolean;
  ood_reasons?: string[]; color_adjusted?: { predicted_class: string; probability: number } | null; heatmap_storage_key: string; worker_ms: number;
};

/** RF01/RF02: recebe o patch (upload ou amostra da galeria), responde do cache ou enfileira. */
export async function POST(req: Request): Promise<NextResponse> {
  const inicio = Date.now();
  const u = await exigirUsuario();
  if (ehResposta(u)) return u;
  if (!u.termoAceito) return erro(403, "TERMS_REQUIRED", "Aceite o termo de uso antes de analisar imagens.");

  const rl = `ratelimit:${u.id}`;
  const [[, n]] = (await redis().multi().incr(rl).expire(rl, 60, "NX").exec()) as [[null, number]];
  if (n > LIMITE_POR_MINUTO) return erro(429, "RATE_LIMITED", "Limite de análises por minuto atingido. Aguarde um pouco.");

  const form = await req.formData().catch(() => null);
  if (!form) return erro(400, "INVALID_INPUT", "Envie a imagem como multipart/form-data.");
  let original: Buffer;
  let origem: "UPLOAD" | "SAMPLE_GALLERY" = "UPLOAD";
  let rotulo: string | null = null;
  const amostraId = form.get("amostra");
  if (typeof amostraId === "string") {
    const a = await buscarAmostra(amostraId);
    if (!a) return erro(404, "SAMPLE_NOT_FOUND", "Amostra não encontrada.");
    original = await lerAmostra(a);
    origem = "SAMPLE_GALLERY";
    rotulo = a.classe;
  } else {
    const arq = form.get("imagem");
    if (!(arq instanceof File)) return erro(400, "INVALID_INPUT", "Nenhuma imagem enviada.");
    if (arq.size > MAX_BYTES) return erro(413, "FILE_TOO_LARGE", "A imagem passa de 5 MB.");
    original = Buffer.from(await arq.arrayBuffer());
  }
  const mime = tipoReal(original);
  if (!mime) return erro(415, "UNSUPPORTED_TYPE", "Formato não suportado. Envie PNG ou JPEG.");

  let recorte: Buffer, largura: number, altura: number;
  try {
    ({ recorte, largura, altura } = await prepararRecorte(original));
  } catch (e) {
    if (e instanceof ImagemInvalida) return erro(422, "IMAGE_TOO_SMALL", e.message);
    return erro(422, "UNREADABLE_IMAGE", "Não foi possível ler a imagem.");
  }

  const hash = sha256(original);
  const modelo = await modeloAtivo();
  const chaveImagem = `images/${hash}.png`;
  await salvar(chaveImagem, recorte);
  const img = await db().query(
    `INSERT INTO images (sha256, mime_type, width, height, size_bytes, storage_key, source, ground_truth_class)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (sha256) DO UPDATE SET sha256 = EXCLUDED.sha256 RETURNING id`,
    [hash, mime, largura, altura, original.length, chaveImagem, origem, rotulo]);
  const imageId: string = img.rows[0].id;

  const emCache = await redis().get(chaveCache(hash, modelo.versao));
  if (emCache) {
    const c = JSON.parse(emCache) as Resultado;
    const r = await db().query(
      `INSERT INTO analyses (user_id, image_id, model_version_id, status, predicted_class, probabilities, heatmap_storage_key,
                             gradcam_target_class, cache_hit, out_of_distribution, ood_reasons, color_adjusted,
                             worker_ms, e2e_ms, completed_at)
       VALUES ($1, $2, $3, 'DONE', $4, $5, $6, $4, true, $7, $8, $9, 0, $10, now()) RETURNING id`,
      [u.id, imageId, modelo.id, c.predicted_class, JSON.stringify(c.probabilities), c.heatmap_storage_key, c.out_of_distribution,
       c.ood_reasons ?? [], c.color_adjusted ? JSON.stringify(c.color_adjusted) : null, Date.now() - inicio]);
    return NextResponse.json({ analysisId: r.rows[0].id, status: "DONE", result: await buscarAnalise(r.rows[0].id, u.id) });
  }

  const jobId = randomUUID();
  const correlationId = randomUUID();
  const r = await db().query(
    "INSERT INTO analyses (user_id, image_id, model_version_id, job_id, status) VALUES ($1, $2, $3, $4, 'QUEUED') RETURNING id",
    [u.id, imageId, modelo.id, jobId]);
  const analysisId: string = r.rows[0].id;
  await redis().set(`job:${jobId}`, JSON.stringify({ status: "QUEUED", analysisId, userId: u.id, at: inicio }), "EX", 3600);
  try {
    await publicarPedido({
      schema_version: "1.0", job_id: jobId, analysis_id: analysisId, image_sha256: hash,
      image_b64: recorte.toString("base64"), mime_type: "image/png", requested_at: new Date().toISOString(),
      target_class: null, correlation_id: correlationId,
    }, correlationId);
  } catch {
    await db().query("UPDATE analyses SET status = 'FAILED', error = 'fila indisponível' WHERE id = $1", [analysisId]);
    return erro(503, "QUEUE_UNAVAILABLE", "O serviço de análise está indisponível. Tente novamente em instantes.");
  }
  console.log(JSON.stringify({ evento: "analise_enfileirada", analysis_id: analysisId, job_id: jobId, correlation_id: correlationId }));
  return NextResponse.json({ analysisId, status: "QUEUED" }, { status: 202 });
}

/** RF06: histórico paginado do próprio usuário. */
export async function GET(req: Request): Promise<NextResponse> {
  const u = await exigirUsuario();
  if (ehResposta(u)) return u;
  const q = new URL(req.url).searchParams;
  const classe = q.get("classe");
  const pagina = Math.max(1, Number(q.get("pagina")) || 1);
  const res = await listarAnalises(u.id, { classe: classe && ehClasse(classe) ? classe : undefined, pagina, porPagina: 20 });
  return NextResponse.json({ items: res.itens, total: res.total, page: pagina, pageSize: 20 });
}
