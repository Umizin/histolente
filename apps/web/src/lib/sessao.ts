import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "./env";
import { db, redis } from "./infra";

export const COOKIE = "hl_sessao";
const TTL_S = 8 * 60 * 60;
export const VERSAO_TERMO = "1.0";

export type Usuario = { id: string; email: string; nome: string; perfil: "STUDENT" | "PROFESSOR" | "ADMIN"; termoAceito: boolean };

export async function criarSessao(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  await redis().set(`session:${token}`, userId, "EX", TTL_S);
  cookies().set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: env().COOKIE_SECURE === "true", path: "/", maxAge: TTL_S });
}

export async function encerrarSessao(): Promise<void> {
  const token = cookies().get(COOKIE)?.value;
  if (token) await redis().del(`session:${token}`);
  cookies().delete(COOKIE);
}

/** Usuário da sessão atual, ou null. Renova o tempo de vida a cada uso (expiração por inatividade). */
export async function usuarioAtual(): Promise<Usuario | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  const id = await redis().get(`session:${token}`);
  if (!id) return null;
  await redis().expire(`session:${token}`, TTL_S);
  const r = await db().query(
    `SELECT u.id, u.email, u.name, u.role,
            EXISTS (SELECT 1 FROM consents c WHERE c.user_id = u.id AND c.document = 'TERMS' AND c.version = $2) AS termo
       FROM users u WHERE u.id = $1`, [id, VERSAO_TERMO]);
  const u = r.rows[0];
  return u ? { id: u.id, email: u.email, nome: u.name, perfil: u.role, termoAceito: u.termo } : null;
}

/** Pseudônimo do titular para o registro de consentimento (HMAC-SHA256 do e-mail com chave secreta). */
export const pseudonimo = (email: string): string => createHmac("sha256", env().SUBJECT_PEPPER).update(email.trim().toLowerCase()).digest("hex");
