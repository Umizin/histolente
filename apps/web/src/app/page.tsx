import { redirect } from "next/navigation";
import { Workstation } from "@/components/Workstation";
import { modeloAtivo } from "@/lib/modelo";
import { usuarioAtual } from "@/lib/sessao";

export default async function Inicio() {
  const u = await usuarioAtual();
  if (!u) redirect("/login");
  if (!u.termoAceito) redirect("/termo");
  const m = await modeloAtivo();
  return <Workstation modeloPreliminar={m.preliminar} />;
}
