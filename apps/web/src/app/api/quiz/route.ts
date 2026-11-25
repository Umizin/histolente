import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { INFO, diferenca, ehClasse } from "@/lib/classes";
import { amostras, urlAmostra } from "@/lib/galeria";
import { ehResposta, erro, exigirUsuario } from "@/lib/http";

export const dynamic = "force-dynamic";

/** HU13: sorteia uma imagem do banco do quiz sem revelar a classe. `evitar` traz as últimas já vistas. */
export async function GET(req: Request): Promise<NextResponse> {
  const u = await exigirUsuario();
  if (ehResposta(u)) return u;
  const evitar = new Set((new URL(req.url).searchParams.get("evitar") ?? "").split(",").slice(0, 40));
  const banco = await amostras("quiz");
  if (banco.length === 0) return erro(503, "QUIZ_EMPTY", "O banco do quiz não está disponível.");
  const opcoes = banco.filter((a) => !evitar.has(a.id));
  const lista = opcoes.length > 0 ? opcoes : banco;
  const a = lista[randomInt(lista.length)]!;
  return NextResponse.json({ id: a.id, url: urlAmostra(a), total: banco.length });
}

const Resposta = z.object({ id: z.string().regex(/^[0-9a-f]{12}$/), resposta: z.string() });

/** Confere a resposta no servidor: o rótulo só sai depois que o estudante responde. */
export async function POST(req: Request): Promise<NextResponse> {
  const u = await exigirUsuario();
  if (ehResposta(u)) return u;
  const corpo = Resposta.safeParse(await req.json().catch(() => null));
  if (!corpo.success || !ehClasse(corpo.data.resposta)) return erro(400, "INVALID_INPUT", "Resposta inválida.");
  const a = (await amostras("quiz")).find((x) => x.id === corpo.data.id);
  if (!a) return erro(404, "SAMPLE_NOT_FOUND", "Amostra não encontrada.");
  const resposta = corpo.data.resposta;
  const correta = resposta === a.classe;
  return NextResponse.json({
    correta,
    classe: a.classe,
    nome: INFO[a.classe].nome,
    criterios: INFO[a.classe].criterios,
    atencao: INFO[a.classe].atencao,
    explicacao: correta ? null : diferenca(a.classe, resposta),
  });
}
