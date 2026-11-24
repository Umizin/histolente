import "server-only";
import { NextResponse } from "next/server";
import { usuarioAtual, type Usuario } from "./sessao";

export const erro = (status: number, codigo: string, mensagem: string): NextResponse =>
  NextResponse.json({ error: { code: codigo, message: mensagem } }, { status });

/** Usuário autenticado ou resposta de erro pronta (401). */
export async function exigirUsuario(): Promise<Usuario | NextResponse> {
  const u = await usuarioAtual();
  return u ?? erro(401, "UNAUTHENTICATED", "Faça login para continuar.");
}

export const ehResposta = (v: unknown): v is NextResponse => v instanceof NextResponse;
