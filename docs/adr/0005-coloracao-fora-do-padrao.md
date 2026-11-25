# ADR 0005 — Coloração fora do padrão: alerta, sem trocar o resultado

- **Data:** 25/11/2026
- **Status:** aceita

## Contexto
No primeiro teste da demonstração com uma imagem de fora do dataset (recorte de mucosa colônica de um atlas, mais pálido e lilás que as imagens de treino), o modelo 0.1.0 sugeriu BACK com 99,1% e o alerta de imagem fora do padrão não disparou: a imagem tinha bastante tecido e a confiança era alta. É o risco R01.

Experimento com essa imagem: mudar a escala (1,5× a 3×) não resolveu; normalizar a coloração pelo método de Macenko (Macenko et al., 2009), com referência tirada do próprio treino, tirou o BACK (a sugestão passou a TUM, com NORM em segundo). A causa principal é a cor. O NCT-CRC-HE-100K foi todo normalizado por Macenko, como informa a página do conjunto de dados (Kather et al., 2018).

Três políticas foram avaliadas no CRC-VAL-HE-7K (n = 7.180), com o mesmo modelo 0.1.0:

| Política | Acurácia | Acurácia balanceada | F1 macro | Acerto DEB | Acerto MUS |
|---|---|---|---|---|---|
| Sem normalização (resultado atual) | 96,6 % | 95,1 % | 95,0 % | 100 % | 94,6 % |
| Normalizar todas as imagens | 93,2 % | 89,6 % | 90,2 % | 76,4 % | 70,9 % |
| Normalizar só com coloração fora do padrão | 94,6 % | 91,4 % | 92,3 % | 76,4 % | 86,3 % |

Relatórios em `ml/reports/r18-preliminar-cor-sempre/` e `ml/reports/r18-preliminar-cor-condicional/`.

Normalizar de novo imagens que já estão no padrão distorce as que têm um corante dominante (necrose, músculo). E 35 % das imagens DEB do conjunto de teste (117 de 339) têm coloração fora da faixa das DEB de treino, mas o modelo acerta todas elas na cor original.

## Decisão
1. **O resultado principal é sempre o da imagem original.** A normalização não substitui a sugestão.
2. **Alerta de coloração** (`coloracao` em `ood_reasons`): a imagem é comparada com a referência de cor do treino pelo ângulo entre os vetores de hematoxilina e de eosina. O limiar é **por classe** (percentil 99,5 dos ângulos das imagens de treino daquela classe), porque a variação natural difere muito: em NORM e TUM os vetores quase não variam (limiares de 2–5°), em BACK, DEB e MUS variam bastante (até 31°). A imagem é marcada quando passa do limiar da classe sugerida para a imagem original ou para a normalizada.
3. **Sugestão com a cor ajustada** (`color_adjusted`), só informativa: com o alerta, a tela mostra também o que o modelo sugere para a imagem normalizada. Se as duas sugestões diferem, a tela avisa que nenhuma delas é confiável.
4. A referência (vetores, concentrações e limiares) é calculada só com imagens de treino (`python -m histolente_ml referencia-cor`, 300 por classe da lista `ml/splits-preliminar/treino.csv`, semente 42) e fica em `ml/histolente_ml/referencia_cor.json`. O conjunto de teste não foi usado para escolher limiares.

## Consequências
- As métricas do modelo no conjunto de teste não mudam (Seção 6 do documento de MVP).
- O alerta de coloração aparece em 4,6 % das imagens do CRC-VAL-HE-7K (331 de 7.180; 117 delas DEB, porque a coloração das DEB do teste difere das de treino; nenhuma LYM). Nas imagens marcadas, a sugestão original acertou 89,1 % (contra 96,6 % no conjunto todo) e a da cor ajustada, 46,5 %. O alerta aponta imagens mais difíceis; a sugestão com a cor ajustada serve para mostrar que a cor influencia o modelo, não como resposta melhor. Relatório em `ml/reports/r18-preliminar-cor/`.
- Cada análise com tecido faz uma passagem a mais pelo modelo (a da imagem normalizada).
- O contrato ganhou dois campos opcionais (`ood_reasons` e `color_adjusted`) sem mudar a versão 1.0; o banco ganhou as colunas correspondentes (`infra/db/migracoes/2026-11-25-cor.sql`).
- A correção de fundo fica para o treino completo: aumento de dados de cor (variação nos espaços HED) para o modelo depender menos da coloração.
