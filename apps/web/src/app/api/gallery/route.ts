import { NextResponse } from "next/server";
import { amostras } from "@/lib/galeria";

export const dynamic = "force-dynamic";

/** Lista as amostras sem revelar a classe verdadeira (o rótulo só aparece depois do resultado). */
export async function GET(): Promise<NextResponse> {
  const lista = await amostras();
  return NextResponse.json({ items: lista.map((a) => ({ id: a.id, url: `/galeria/${a.arquivo}` })) });
}
