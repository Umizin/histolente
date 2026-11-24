import { NextResponse } from "next/server";
import { db, redis } from "@/lib/infra";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    await Promise.all([db().query("SELECT 1"), redis().ping()]);
    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "indisponivel" }, { status: 503 });
  }
}
