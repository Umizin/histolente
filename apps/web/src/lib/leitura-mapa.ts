/** Leitura do mapa Grad-CAM em linguagem simples, montada só a partir das medidas do serviço de inferência.
 *  O texto descreve ONDE o modelo se apoiou e O QUE há nessa região; não afirma o raciocínio do modelo. */

export type ResumoMapa = {
  hot_fraction: number;
  centroid: [number, number];
  background_hot: number;
  background_rest: number | null;
  hematoxylin_ratio: number | null;
  eosin_ratio: number | null;
};

const num = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const numOuNulo = (v: unknown): v is number | null => v === null || num(v);

export function lerResumo(v: unknown): ResumoMapa | null {
  if (!v || typeof v !== "object") return null;
  const r = v as Record<string, unknown>;
  const c = r.centroid;
  if (!num(r.hot_fraction) || !Array.isArray(c) || !num(c[0]) || !num(c[1]) || !num(r.background_hot)
    || !numOuNulo(r.background_rest) || !numOuNulo(r.hematoxylin_ratio) || !numOuNulo(r.eosin_ratio)) return null;
  return {
    hot_fraction: r.hot_fraction, centroid: [c[0], c[1]], background_hot: r.background_hot,
    background_rest: r.background_rest, hematoxylin_ratio: r.hematoxylin_ratio, eosin_ratio: r.eosin_ratio,
  };
}

const vezes = (v: number): string => `${v.toFixed(1).replace(".", ",")}×`;
const porcento = (v: number): string => `${Math.max(1, Math.round(v * 100))}%`;

export function local([x, y]: [number, number]): string {
  const h = x < 0.38 ? "esquerda" : x > 0.62 ? "direita" : null;
  const v = y < 0.38 ? "superior" : y > 0.62 ? "inferior" : null;
  if (h && v) return `na parte ${v} ${h}`;
  if (v) return `na parte ${v}`;
  if (h) return `à ${h}`;
  return "no centro";
}

export function onde(r: ResumoMapa): string {
  const p = porcento(r.hot_fraction);
  if (r.hot_fraction > 0.55) return `A influência está espalhada por boa parte do recorte (cerca de ${p} da área).`;
  if (r.hot_fraction < 0.08) return `A influência está concentrada numa área pequena, ${local(r.centroid)} (cerca de ${p} do recorte).`;
  return `A influência está concentrada ${local(r.centroid)} (cerca de ${p} do recorte).`;
}

export function conteudo(r: ResumoMapa): string {
  if (r.background_hot >= 0.5) return "A região destacada é sobretudo espaço claro, sem tecido corado.";
  if (r.hematoxylin_ratio === null && r.eosin_ratio === null) return "A região ocupa quase todo o recorte; não há restante para comparar.";
  const partes: string[] = [];
  const h = r.hematoxylin_ratio;
  const e = r.eosin_ratio;
  if (h !== null) {
    if (h >= 1.25) partes.push(`a hematoxilina, que cora os núcleos, é ${vezes(h)} mais intensa que no restante do recorte`);
    else if (h <= 0.8) partes.push(`a hematoxilina (núcleos) é mais fraca que no restante (${vezes(h)})`);
    else partes.push("a intensidade da hematoxilina (núcleos) é parecida com a do restante");
  }
  if (e !== null) {
    if (e >= 1.25) partes.push(`a eosina (citoplasma, fibras e matriz) é ${vezes(e)} mais intensa`);
    else if (e <= 0.8) partes.push(`a eosina (citoplasma, fibras e matriz) é mais fraca (${vezes(e)})`);
    else if (h !== null && h > 0.8 && h < 1.25) partes[partes.length - 1] += ", e a da eosina também";
  }
  if (r.background_rest !== null) {
    const d = r.background_hot - r.background_rest;
    if (d <= -0.2) partes.push("há menos espaço claro que no restante");
    else if (d >= 0.2) partes.push("há mais espaço claro que no restante");
  }
  const frase = partes.length > 1 ? `${partes.slice(0, -1).join("; ")}; e ${partes[partes.length - 1]}` : partes[0] ?? "";
  return frase ? `Nessa região, ${frase}.` : "";
}
