import { describe, expect, it } from "vitest";
import { CLASSES, INFO, TERMOS_PROIBIDOS, diferenca } from "./classes";
import { tipoReal } from "./imagem";

describe("RN01 — tipo real do arquivo", () => {
  it("reconhece PNG e JPEG pela assinatura", () => {
    expect(tipoReal(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("image/png");
    expect(tipoReal(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
  });
  it("recusa GIF mesmo com extensão de imagem", () => {
    expect(tipoReal(new TextEncoder().encode("GIF89a......"))).toBeNull();
  });
});

describe("Classes", () => {
  it("mantém a ordem canônica do modelo", () => {
    expect([...CLASSES]).toEqual([...CLASSES].sort());
  });
  it("diferença entre pares é simétrica", () => {
    expect(diferenca("STR", "MUS")).toBe(diferenca("MUS", "STR"));
  });
});

describe("RN04 — linguagem da saída", () => {
  it("nenhum texto de classe usa termo proibido", () => {
    for (const c of CLASSES) {
      const texto = `${INFO[c].nome} ${INFO[c].criterios} ${INFO[c].atencao}`.toLowerCase();
      for (const t of TERMOS_PROIBIDOS) expect(texto, `${c}: ${t}`).not.toContain(t);
    }
  });
});

import { colorir } from "./cores";
describe("Mapa de calor", () => {
  it("zero vira transparente e o máximo fica opaco", () => {
    const px = colorir(new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 255]), "viridis", false);
    expect(px[3]).toBe(0);
    expect(px[7]).toBe(255);
  });
});
