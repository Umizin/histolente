import { redirect } from "next/navigation";
import { usuarioAtual } from "@/lib/sessao";
import { Quiz } from "./Quiz";

export default async function Pagina() {
  const u = await usuarioAtual();
  if (!u) redirect("/login");
  if (!u.termoAceito) redirect("/termo");
  return <Quiz />;
}
