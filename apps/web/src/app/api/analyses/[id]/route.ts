import { NextResponse } from "next/server";
import { buscarAnalise } from "@/lib/analises";
import { ehResposta, erro, exigirUsuario } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }): Promise<NextResponse> {
  const u = await exigirUsuario();
  if (ehResposta(u)) return u;
  const a = await buscarAnalise(params.id, u.id);
  return a ? NextResponse.json(a) : erro(404, "NOT_FOUND", "Análise não encontrada.");
}
