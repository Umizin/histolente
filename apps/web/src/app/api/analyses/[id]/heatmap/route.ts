import { NextResponse } from "next/server";
import { ler } from "@/lib/armazenamento";
import { ehResposta, erro, exigirUsuario } from "@/lib/http";
import { db } from "@/lib/infra";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }): Promise<NextResponse> {
  const u = await exigirUsuario();
  if (ehResposta(u)) return u;
  if (!/^[0-9a-f-]{36}$/.test(params.id)) return erro(404, "NOT_FOUND", "Não encontrado.");
  const r = await db().query(
    "SELECT a.heatmap_storage_key AS chave FROM analyses a JOIN images i ON i.id = a.image_id WHERE a.id = $1 AND a.user_id = $2",
    [params.id, u.id]);
  const chave: string | null | undefined = r.rows[0]?.chave;
  if (!chave) return erro(404, "NOT_FOUND", "Não encontrado.");
  return new NextResponse(await ler(chave), { headers: { "Content-Type": "image/png", "Cache-Control": "private, max-age=86400" } });
}
