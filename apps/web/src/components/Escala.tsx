/** Barra de escala do visualizador. O recorte tem 224 px a 0,5 µm/px, ou seja, cerca de 112 µm de lado.
 *  Escolhe o comprimento redondo que ocupa entre ~12% e ~40% da largura no zoom atual. */
const LADO_UM = 112;
const OPCOES = [100, 50, 20, 10, 5, 2];

export function Escala({ z = 1 }: { z?: number }) {
  const largura = (um: number) => (um / LADO_UM) * z * 100; // em cqw: % da largura do visualizador
  const um = OPCOES.find((o) => largura(o) <= 40) ?? 2;
  return (
    <div className="escala" aria-hidden="true">
      <span>{um} µm</span>
      <i style={{ width: `${largura(um)}cqw` }} />
    </div>
  );
}
