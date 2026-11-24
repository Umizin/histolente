import "server-only";
import amqp, { type ConfirmChannel } from "amqplib";
import { Redis } from "ioredis";
import { Pool } from "pg";
import { env } from "./env";

// Conexões reaproveitadas entre requisições (uma por processo).
const g = globalThis as unknown as { _pool?: Pool; _redis?: Redis; _canal?: Promise<ConfirmChannel> };

export function db(): Pool {
  g._pool ??= new Pool({ connectionString: env().DATABASE_URL, max: 10 });
  return g._pool;
}

export function redis(): Redis {
  g._redis ??= new Redis(env().REDIS_URL, { maxRetriesPerRequest: 3 });
  return g._redis;
}

/** Assinante dedicado (uma conexão Redis em modo Pub/Sub por canal SSE aberto). */
export const novoAssinante = (): Redis => new Redis(env().REDIS_URL);

async function abrirCanal(): Promise<ConfirmChannel> {
  const con = await amqp.connect(env().AMQP_URL);
  const ch = await con.createConfirmChannel();
  // Mesma topologia de infra/rabbitmq/topologia.py (declaração idempotente)
  await ch.assertExchange("inference", "direct", { durable: true });
  await ch.assertExchange("inference.dlx", "direct", { durable: true });
  for (const [fila, chave] of [["inference.request", "request"], ["inference.completed", "completed"]] as const) {
    await ch.assertQueue(fila, { durable: true, arguments: { "x-dead-letter-exchange": "inference.dlx", "x-dead-letter-routing-key": fila } });
    await ch.bindQueue(fila, "inference", chave);
  }
  await ch.assertQueue("inference.dlq", { durable: true });
  await ch.bindQueue("inference.dlq", "inference.dlx", "inference.request");
  await ch.bindQueue("inference.dlq", "inference.dlx", "inference.completed");
  con.on("close", () => { g._canal = undefined; });
  return ch;
}

/** Publica com confirmação do broker (publisher confirm). */
export async function publicarPedido(corpo: object, correlationId: string): Promise<void> {
  g._canal ??= abrirCanal();
  const ch = await g._canal;
  await new Promise<void>((ok, falha) =>
    ch.publish("inference", "request", Buffer.from(JSON.stringify(corpo)), { persistent: true, contentType: "application/json", correlationId }, (e) => (e ? falha(e) : ok())),
  );
}
