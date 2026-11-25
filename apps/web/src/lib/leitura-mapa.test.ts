import { describe, expect, it } from "vitest";
import { TERMOS_PROIBIDOS } from "./classes";
import { conteudo, lerResumo, local, onde, type ResumoMapa } from "./leitura-mapa";

const base: ResumoMapa = { hot_fraction: 0.22, centroid: [0.5, 0.5], background_hot: 0.05, background_rest: 0.1, hematoxylin_ratio: 1, eosin_ratio: 1 };

describe("leitura do mapa", () => {
  it("descreve a posição pela região do recorte", () => {
    expect(local([0.2, 0.2])).toBe("na parte superior esquerda");
    expect(local([0.5, 0.8])).toBe("na parte inferior");
    expect(local([0.8, 0.5])).toBe("à direita");
    expect(local([0.5, 0.5])).toBe("no centro");
  });

  it("diferencia influência concentrada e espalhada", () => {
    expect(onde({ ...base, centroid: [0.8, 0.2] })).toBe("A influência está concentrada na parte superior direita (cerca de 22% do recorte).");
    expect(onde({ ...base, hot_fraction: 0.7 })).toMatch(/espalhada/);
    expect(onde({ ...base, hot_fraction: 0.03 })).toMatch(/área pequena/);
  });

  it("relata núcleos mais intensos com o número medido", () => {
    expect(conteudo({ ...base, hematoxylin_ratio: 2.18, eosin_ratio: 1.0 })).toBe(
      "Nessa região, a hematoxilina, que cora os núcleos, é 2,2× mais intensa que no restante do recorte.");
  });

  it("diz quando não há diferença, sem inventar explicação", () => {
    expect(conteudo(base)).toBe("Nessa região, a intensidade da hematoxilina (núcleos) é parecida com a do restante, e a da eosina também.");
  });

  it("reconhece região de espaço claro e de menos espaço claro", () => {
    expect(conteudo({ ...base, background_hot: 0.8 })).toMatch(/espaço claro, sem tecido/);
    expect(conteudo({ ...base, background_hot: 0.57, background_rest: 0.89 })).toMatch(/espaço claro, sem tecido/);
    expect(conteudo({ ...base, background_hot: 0.3, background_rest: 0.9, eosin_ratio: 3.8 })).toMatch(/eosina .* 3,8× mais intensa; e há menos espaço claro/);
  });

  it("valida o resumo vindo do banco", () => {
    expect(lerResumo({ ...base })).toEqual(base);
    expect(lerResumo({ ...base, centroid: [0.5] })).toBeNull();
    expect(lerResumo(null)).toBeNull();
  });

  it("não usa termos de laudo", () => {
    const textos = [onde(base), conteudo({ ...base, hematoxylin_ratio: 2 }), conteudo({ ...base, background_hot: 0.9 })].join(" ").toLowerCase();
    for (const t of TERMOS_PROIBIDOS) expect(textos).not.toContain(t);
  });
});
