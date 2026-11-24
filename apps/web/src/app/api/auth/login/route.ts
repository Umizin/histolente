import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { erro } from "@/lib/http";
import { db, redis } from "@/lib/infra";
import { criarSessao } from "@/lib/sessao";

const Corpo = z.object({ email: z.string().trim().toLowerCase().email(), senha: z.string().min(1).max(200) });
// Hash fixo para gastar o mesmo tempo quando o e-mail não existe
let falso: string | null = null;
const hashFalso = (): string => (falso ??= bcrypt.hashSync("senha-inexistente", 12));

export async function POST(req: Request): Promise<NextResponse> {
  const p = Corpo.safeParse(await req.json().catch(() => null));
  if (!p.success) return erro(400, "INVALID_INPUT", "Informe e-mail e senha.");
  const chave = `login:${p.data.email}`;
  if (Number(await redis().get(chave)) >= 10) return erro(429, "TOO_MANY_ATTEMPTS", "Muitas tentativas. Aguarde alguns minutos.");
  const r = await db().query("SELECT id, password_hash FROM users WHERE email = $1", [p.data.email]);
  const ok = await bcrypt.compare(p.data.senha, r.rows[0]?.password_hash ?? hashFalso());
  if (!ok || !r.rows[0]) {
    await redis().multi().incr(chave).expire(chave, 600).exec();
    return erro(401, "INVALID_CREDENTIALS", "E-mail ou senha incorretos.");
  }
  await redis().del(chave);
  await criarSessao(r.rows[0].id);
  return NextResponse.json({ ok: true });
}
