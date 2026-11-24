/** Paletas perceptualmente ordenadas para o mapa (sem vermelho/rosa como cor de interface). */
export type Paleta = "viridis" | "turbo";

export function turbo(t: number): [number, number, number] {
  const r = 34.61 + t * (1172.33 - t * (10793.56 - t * (33300.12 - t * (38394.49 - t * 14825.05))));
  const g = 23.31 + t * (557.33 + t * (1225.33 - t * (3574.96 - t * (1073.77 + t * 707.56))));
  const b = 27.2 + t * (3211.1 - t * (15327.97 - t * (27814 - t * (22569.18 - t * 6838.66))));
  const c = (v: number) => Math.max(0, Math.min(255, v));
  return [c(r), c(g), c(b)];
}

const V: [number, number, number][] = [[68, 1, 84], [59, 82, 139], [33, 145, 140], [94, 201, 98], [253, 231, 37]];
export function viridis(t: number): [number, number, number] {
  const x = Math.max(0, Math.min(1, t)) * 4;
  const i = Math.min(3, Math.floor(x));
  const f = x - i;
  const a = V[i]!, b = V[i + 1]!;
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

/** Converte o mapa em tons de cinza (0–255) em RGBA colorido; no modo contorno, só as isolinhas 50% e 75%. */
export function colorir(cinza: Uint8ClampedArray, paleta: Paleta, contorno: boolean): Uint8ClampedArray {
  const f = paleta === "viridis" ? viridis : turbo;
  const out = new Uint8ClampedArray(cinza.length);
  for (let o = 0; o < cinza.length; o += 4) {
    const v = (cinza[o] ?? 0) / 255;
    if (contorno) {
      const linha = Math.abs(v - 0.5) < 0.012 || Math.abs(v - 0.75) < 0.012;
      out[o] = out[o + 1] = out[o + 2] = 255;
      out[o + 3] = linha ? 255 : 0;
    } else {
      const [r, g, b] = f(v);
      out[o] = r; out[o + 1] = g; out[o + 2] = b;
      out[o + 3] = 255 * Math.min(1, v * 1.4);
    }
  }
  return out;
}

export const gradiente = (p: Paleta): string =>
  `linear-gradient(90deg,${[0, 0.25, 0.5, 0.75, 1].map((t) => `rgb(${(p === "viridis" ? viridis : turbo)(t).map(Math.round).join(",")})`).join(",")})`;
