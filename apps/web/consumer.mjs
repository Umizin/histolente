// Consumidor de inference.completed (Orquestração). Único ponto que grava o resultado no PostgreSQL:
// salva o mapa, atualiza a análise, preenche o cache e avisa o navegador pelo canal Redis user:{id}.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import amqp from "amqplib";
import { Redis } from "ioredis";
import pg from "pg";

const { DATABASE_URL, REDIS_URL, AMQP_URL, STORAGE_DIR = "/data" } = process.env;
for (const [k, v] of Object.entries({ DATABASE_URL, REDIS_URL, AMQP_URL })) if (!v) throw new Error(`${k} não definido`);

const CLASSES = ["ADI", "BACK", "DEB", "LYM", "MUC", "MUS", "NORM", "STR", "TUM"];
const CACHE_TTL_S = 7 * 24 * 3600;
const SINAL_DE_VIDA = "/tmp/consumidor-vivo";
const PREPARO = "cor2"; // igual a PREPARO em src/lib/modelo.ts
const MOTIVOS = ["pouco_tecido", "baixa_confianca", "coloracao"];
const pool = new pg.Pool({ connectionString: DATABASE_URL, max: 4 });
const redis = new Redis(REDIS_URL);
const log = (evento, extra) => console.log(JSON.stringify({ evento, ...extra, ts: new Date().toISOString() }));

function valido(m) {
  if (m?.schema_version !== "1.0" || typeof m.job_id !== "string" || !["DONE", "FAILED"].includes(m.status)) return false;
  if (m.status === "FAILED") return true;
  if (!CLASSES.includes(m.predicted_class) || !m.probabilities || !m.gradcam?.heatmap_png_b64) return false;
  const soma = CLASSES.reduce((s, c) => s + Number(m.probabilities[c] ?? NaN), 0);
  return Math.abs(soma - 1) <= 1e-4;
}

async function versaoModelo(cli, model) {
  const r = await cli.query(
    `INSERT INTO model_versions (name, version, file_sha256, backbone) VALUES ($1, $2, $3, $4)
     ON CONFLICT (version) DO UPDATE SET version = EXCLUDED.version RETURNING id`,
    [model.name, model.version, model.sha256, model.name.split("-")[0]]);
  return r.rows[0].id;
}

async function processar(m) {
  const cli = await pool.connect();
  try {
    await cli.query("BEGIN");
    const a = await cli.query(
      `SELECT a.id, a.user_id, a.created_at, i.sha256 FROM analyses a JOIN images i ON i.id = a.image_id
        WHERE a.job_id = $1 AND a.status IN ('QUEUED', 'PROCESSING') FOR UPDATE OF a`, [m.job_id]);
    const alvo = a.rows[0];
    if (!alvo) { await cli.query("ROLLBACK"); log("duplicada_ignorada", { job_id: m.job_id }); return; } // idempotência
    const mv = await versaoModelo(cli, m.model);
    if (m.status === "FAILED") {
      await cli.query("UPDATE analyses SET status = 'FAILED', error = $2, model_version_id = $3, completed_at = now() WHERE id = $1",
        [alvo.id, String(m.error ?? "falha no processamento").slice(0, 500), mv]);
    } else {
      const chave = `heatmaps/${alvo.id}.png`;
      await mkdir(path.join(STORAGE_DIR, "heatmaps"), { recursive: true });
      await writeFile(path.join(STORAGE_DIR, chave), Buffer.from(m.gradcam.heatmap_png_b64, "base64"));
      const e2e = Math.max(0, Date.now() - alvo.created_at.getTime());
      const motivos = Array.isArray(m.ood_reasons) ? m.ood_reasons.filter((x) => MOTIVOS.includes(x)) : [];
      const s = m.gradcam.summary;
      const resumo = s && typeof s.hot_fraction === "number" && Array.isArray(s.centroid) ? s : null;
      const corAjustada = m.color_adjusted && CLASSES.includes(m.color_adjusted.predicted_class)
        && typeof m.color_adjusted.probability === "number"
        ? { predicted_class: m.color_adjusted.predicted_class, probability: m.color_adjusted.probability } : null;
      await cli.query(
        `UPDATE analyses SET status = 'DONE', predicted_class = $2, probabilities = $3, heatmap_storage_key = $4,
                gradcam_target_class = $5, out_of_distribution = $6, ood_method = $7, worker_ms = $8, e2e_ms = $9,
                model_version_id = $10, ood_reasons = $11, color_adjusted = $12, gradcam_summary = $13, completed_at = now() WHERE id = $1`,
        [alvo.id, m.predicted_class, JSON.stringify(m.probabilities), chave, m.gradcam.target_class ?? m.predicted_class,
         Boolean(m.out_of_distribution), "tecido+msp+cor", Math.round(m.timings_ms?.total_worker ?? 0), e2e, mv,
         motivos, corAjustada && JSON.stringify(corAjustada), resumo && JSON.stringify(resumo)]);
      await redis.set(`cache:sha256:${alvo.sha256}:${m.model.version}:${PREPARO}:pred`, JSON.stringify({
        predicted_class: m.predicted_class, probabilities: m.probabilities, out_of_distribution: Boolean(m.out_of_distribution),
        ood_reasons: motivos, color_adjusted: corAjustada, gradcam_summary: resumo,
        heatmap_storage_key: chave, worker_ms: Math.round(m.timings_ms?.total_worker ?? 0),
      }), "EX", CACHE_TTL_S);
    }
    await cli.query("COMMIT");
    await redis.set(`job:${m.job_id}`, JSON.stringify({ status: m.status, analysisId: alvo.id }), "EX", 3600);
    await redis.publish(`user:${alvo.user_id}`, JSON.stringify({ analysisId: alvo.id, status: m.status }));
    log("resultado_gravado", { analysis_id: alvo.id, job_id: m.job_id, status: m.status, correlation_id: m.correlation_id });
  } catch (e) {
    await cli.query("ROLLBACK").catch(() => undefined);
    throw e;
  } finally {
    cli.release();
  }
}

async function iniciar() {
  const con = await amqp.connect(AMQP_URL);
  con.on("close", () => { log("conexao_perdida", {}); process.exit(1); }); // o Compose reinicia o contêiner
  const ch = await con.createChannel();
  await ch.assertExchange("inference", "direct", { durable: true });
  await ch.assertExchange("inference.dlx", "direct", { durable: true });
  for (const [fila, chave] of [["inference.request", "request"], ["inference.completed", "completed"]]) {
    await ch.assertQueue(fila, { durable: true, arguments: { "x-dead-letter-exchange": "inference.dlx", "x-dead-letter-routing-key": fila } });
    await ch.bindQueue(fila, "inference", chave);
  }
  await ch.assertQueue("inference.dlq", { durable: true });
  await ch.bindQueue("inference.dlq", "inference.dlx", "inference.request");
  await ch.bindQueue("inference.dlq", "inference.dlx", "inference.completed");
  await ch.prefetch(8);
  await ch.consume("inference.completed", async (msg) => {
    if (!msg) return;
    let corpo;
    try { corpo = JSON.parse(msg.content.toString()); } catch { corpo = null; }
    if (!valido(corpo)) { log("mensagem_invalida", { job_id: corpo?.job_id }); ch.reject(msg, false); return; } // vai para a DLQ
    try {
      await processar(corpo);
      ch.ack(msg);
    } catch (e) {
      log("erro_processamento", { job_id: corpo.job_id, erro: String(e) });
      const tentativas = Number(msg.properties.headers?.["x-tentativa"] ?? 0) + 1;
      if (tentativas >= 3) { ch.reject(msg, false); return; }
      await new Promise((r) => setTimeout(r, 1000 * tentativas));
      ch.publish("inference", "completed", msg.content, { ...msg.properties, headers: { ...msg.properties.headers, "x-tentativa": tentativas } });
      ch.ack(msg);
    }
  }, { noAck: false });
  log("consumindo", { fila: "inference.completed" });
  // Sinal de vida para o healthcheck do Compose: só é gravado enquanto o canal com o RabbitMQ está aberto
  const vivo = () => writeFile(SINAL_DE_VIDA, String(Date.now())).catch(() => undefined);
  await vivo();
  setInterval(vivo, 10_000).unref();
  ch.on("close", () => { log("canal_fechado", {}); process.exit(1); });
}

iniciar().catch((e) => { console.error(e); process.exit(1); });
