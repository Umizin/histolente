import { ehResposta, exigirUsuario } from "@/lib/http";
import { novoAssinante } from "@/lib/infra";

export const dynamic = "force-dynamic";

/**
 * SSE: um fluxo por usuário, alimentado pelo canal Redis user:{id}.
 * O cliente assina primeiro e depois consulta o estado da análise, para não perder evento.
 */
export async function GET(req: Request): Promise<Response> {
  const u = await exigirUsuario();
  if (ehResposta(u)) return u;
  const sub = novoAssinante();
  const enc = new TextEncoder();
  let fechar = (): void => undefined;
  const stream = new ReadableStream<Uint8Array>({
    async start(ctl) {
      const enviar = (s: string): void => { try { ctl.enqueue(enc.encode(s)); } catch { fechar(); } };
      const pulso = setInterval(() => enviar(": ping\n\n"), 15000);
      fechar = (): void => { clearInterval(pulso); sub.disconnect(); try { ctl.close(); } catch { /* já fechado */ } };
      req.signal.addEventListener("abort", fechar);
      sub.on("message", (_canal: string, msg: string) => enviar(`event: analysis\ndata: ${msg}\n\n`));
      await sub.subscribe(`user:${u.id}`);
      enviar("retry: 3000\nevent: ready\ndata: {}\n\n");
    },
    cancel() { fechar(); },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" } });
}
