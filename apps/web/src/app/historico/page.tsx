import { redirect } from "next/navigation";
import { usuarioAtual } from "@/lib/sessao";
import { Historico } from "./Historico";

export default async function Pagina() {
  const u = await usuarioAtual();
  if (!u) redirect("/login");
  return <Historico />;
}
