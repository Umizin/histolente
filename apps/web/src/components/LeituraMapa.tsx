import { Info } from "lucide-react";
import { INFO, type Classe } from "@/lib/classes";
import { conteudo, onde, type ResumoMapa } from "@/lib/leitura-mapa";

/** "Como ler este mapa": o que a região destacada contém, medido na imagem, e os limites do Grad-CAM. */
export function LeituraMapa({ classe, resumo, oculto }: { classe: Classe; resumo: ResumoMapa | null; oculto: boolean }) {
  return (
    <section className="leitura" aria-label="Como ler este mapa">
      <h3><Info className="ico" aria-hidden="true" />Como ler este mapa</h3>
      {oculto ? (
        <p>O mapa foi ocultado porque a imagem difere do padrão usado no treino.</p>
      ) : resumo ? (
        <p>{onde(resumo)} {conteudo(resumo)}</p>
      ) : (
        <p>O mapa é uniforme: nenhuma região se destacou para a classe sugerida.</p>
      )}
      <p>Compare a região destacada com os critérios de <strong>{INFO[classe].nome}</strong>: {INFO[classe].criterios}</p>
      <details>
        <summary>O que o mapa mostra e o que não mostra</summary>
        <ul>
          <li>Mostra as regiões que mais aumentaram a pontuação da classe sugerida (Grad-CAM, calculado na última camada convolucional da rede).</li>
          <li>A resolução é baixa: uma grade de 7 × 7 ampliada para o recorte, em que cada célula cobre cerca de 16 µm. Ele não aponta núcleos ou células isoladas.</li>
          <li>Indica onde o modelo se apoiou, não o motivo da sugestão nem a localização de uma lesão.</li>
          <li>As medidas acima consideram a área em que o mapa passa de 50% do valor máximo e descrevem o que há nela (intensidade da hematoxilina e da eosina, espaço claro). A relação com a morfologia é para você avaliar.</li>
        </ul>
      </details>
    </section>
  );
}
