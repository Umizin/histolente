import { z } from "zod";

const Env = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  AMQP_URL: z.string().min(1),
  MODEL_DIR: z.string().default("/models"),
  STORAGE_DIR: z.string().default("/data"),
  SUBJECT_PEPPER: z.string().min(16),
  COOKIE_SECURE: z.enum(["true", "false"]).default("false"),
});

let cache: z.infer<typeof Env> | null = null;

/** Configuração validada na primeira leitura (12-factor). */
export function env(): z.infer<typeof Env> {
  cache ??= Env.parse(process.env);
  return cache;
}
