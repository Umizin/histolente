import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { erro } from "@/lib/http";
import { db } from "@/lib/infra";
import { criarSessao } from "@/lib/sessao";

const Corpo = z.object({
  nome: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email().max(200),
  senha: z.string().min(10, "A senha precisa de pelo menos 10 caracteres.").max(200),
  perfil: z.enum(["STUDENT", "PROFESSOR"]).default("STUDENT"),
});

export async function POST(req: Request): Promise<NextResponse> {
  const p = Corpo.safeParse(await req.json().catch(() => null));
  if (!p.success) return erro(400, "INVALID_INPUT", p.error.issues[0]?.message ?? "Dados inválidos.");
  const hash = await bcrypt.hash(p.data.senha, 12);
  const r = await db().query(
    "INSERT INTO users (email, name, role, password_hash) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING RETURNING id",
    [p.data.email, p.data.nome, p.data.perfil, hash]);
  if (!r.rows[0]) return erro(409, "EMAIL_IN_USE", "Já existe uma conta com este e-mail.");
  await criarSessao(r.rows[0].id);
  return NextResponse.json({ ok: true }, { status: 201 });
}
