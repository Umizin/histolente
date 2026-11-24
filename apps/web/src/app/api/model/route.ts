import { NextResponse } from "next/server";
import { modeloAtivo } from "@/lib/modelo";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const m = await modeloAtivo();
  return NextResponse.json({ name: m.nome, version: m.versao, sha256: m.sha256, backbone: m.backbone, preliminary: m.preliminar, metrics: m.metricas });
}
