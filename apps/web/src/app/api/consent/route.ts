import { NextResponse } from "next/server";
import { ehResposta, exigirUsuario } from "@/lib/http";
import { db } from "@/lib/infra";
import { VERSAO_TERMO, pseudonimo } from "@/lib/sessao";

/** Aceite do termo de uso (RF07/RNF04). O registro guarda o pseudônimo do titular. */
export async function POST(): Promise<NextResponse> {
  const u = await exigirUsuario();
  if (ehResposta(u)) return u;
  await db().query(
    `INSERT INTO consents (user_id, subject_ref, document, version) VALUES ($1, $2, 'TERMS', $3)
     ON CONFLICT (subject_ref, document, version) DO UPDATE SET user_id = EXCLUDED.user_id`,
    [u.id, pseudonimo(u.email), VERSAO_TERMO]);
  return NextResponse.json({ ok: true, version: VERSAO_TERMO });
}
