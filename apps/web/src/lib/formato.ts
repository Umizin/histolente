/** Percentual com vírgula; nunca exibe 100% nem 0% exatos, que sugerem uma certeza que o modelo não tem. */
export const pct = (v: number): string =>
  v > 0.999 ? "> 99,9%" : v > 0 && v < 0.001 ? "< 0,1%" : `${(v * 100).toFixed(1).replace(".", ",")}%`;
