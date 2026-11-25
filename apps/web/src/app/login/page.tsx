"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

export default function Login() {
  const router = useRouter();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [mosaico, setMosaico] = useState<string[]>([]);
  useEffect(() => {
    fetch("/api/gallery").then((r) => r.json()).then((j: { items: { url: string }[] }) => setMosaico(j.items.slice(0, 9).map((i) => i.url))).catch(() => undefined);
  }, []);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    const f = new FormData(e.currentTarget);
    const corpo = modo === "entrar"
      ? { email: f.get("email"), senha: f.get("senha") }
      : { nome: f.get("nome"), email: f.get("email"), senha: f.get("senha"), perfil: f.get("perfil") };
    const r = await fetch(modo === "entrar" ? "/api/auth/login" : "/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo),
    }).catch(() => null);
    setEnviando(false);
    if (!r?.ok) {
      const j = (await r?.json().catch(() => null)) as { error?: { message?: string } } | null;
      setErro(j?.error?.message ?? "Não foi possível conectar. Tente de novo.");
      return;
    }
    router.push(modo === "criar" ? "/termo" : "/");
    router.refresh();
  }

  return (
    <div className="acesso">
      <section className="intro">
        <h1>Aprenda a reconhecer os padrões do câncer colorretal na lâmina.</h1>
        <p>Envie um recorte H&amp;E ou escolha uma amostra: o HistoLente sugere o padrão tecidual, mostra a confiança em cada uma das nove classes e destaca as regiões que mais pesaram na sugestão.</p>
        {mosaico.length > 0 && (
          <div className="mosaico" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {mosaico.map((u) => <img key={u} src={u} alt="" />)}
          </div>
        )}
      </section>
      <form className="form panel" onSubmit={enviar} aria-labelledby="titulo">
        <h2 id="titulo">{modo === "entrar" ? "Entrar" : "Criar conta"}</h2>
        {modo === "criar" && <label>Nome<input name="nome" required maxLength={120} autoComplete="name" /></label>}
        <label>E-mail<input name="email" type="email" required autoComplete="email" /></label>
        <label>Senha<input name="senha" type="password" required minLength={modo === "criar" ? 10 : 1} autoComplete={modo === "criar" ? "new-password" : "current-password"} /></label>
        {modo === "criar" && (
          <label>Perfil
            <select name="perfil" defaultValue="STUDENT"><option value="STUDENT">Estudante</option><option value="PROFESSOR">Professor(a)</option></select>
          </label>
        )}
        {erro && <div className="alert err" role="alert">{erro}</div>}
        <button className="btn" disabled={enviando}>{enviando ? "Aguarde…" : modo === "entrar" ? "Entrar" : "Criar conta"}</button>
        <p className="alt">
          {modo === "entrar" ? "Primeiro acesso? " : "Já tem conta? "}
          <button type="button" className="linkbtn" onClick={() => { setErro(null); setModo(modo === "entrar" ? "criar" : "entrar"); }}>
            {modo === "entrar" ? "Criar conta" : "Entrar"}
          </button>
        </p>
      </form>
    </div>
  );
}
