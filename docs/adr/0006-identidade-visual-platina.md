# ADR 0006 — Identidade visual "Platina"

- **Data:** 25/11/2026
- **Status:** aceita (revisa os tokens do guia de estilo da Seção 4.3 do projeto)

## Contexto
O MVP reaproveitou o CSS do protótipo (ADR 0003). As fontes declaradas (Inter e JetBrains Mono) nunca eram carregadas, e a tela caía na fonte do sistema. A interface não tinha ícones, usava títulos em caixa alta e numerava as miniaturas da galeria ("#1", "#2"), que não formam uma sequência. A revisão de design usou duas *skills* de design do Claude Code: *frontend-design* (direção estética, tipografia, revisão contra padrões genéricos) e *ui-ux-pro-max* (regras de acessibilidade, interação e responsividade).

## Decisão
O vocabulário visual vem do assunto: o microscópio e o atlas de histologia.

- **Cores:** grafite esverdeado (estativa `#0D1517`, platina `#142024`, lamínula `#1B2A2F`) e acento verdete (`#2BC3AE`), aviso âmbar (`#E9B44C`) e erro laranja (`#F08A3C`). Continua valendo a regra de nunca usar vermelho, rosa ou roxo na interface. O tema claro, para projetor de sala de aula, redefine os mesmos tokens e é escolhido no cabeçalho.
- **Tipografia:** Instrument Sans na interface; Source Serif 4 no nome da classe sugerida e nos títulos, como a legenda de uma prancha de atlas. As fontes são servidas pelo próprio site (`next/font`), sem requisição do navegador ao Google.
- **Elemento marcante:** o visualizador é tratado como a platina do microscópio: moldura dupla e **barra de escala em micrômetros** que acompanha o zoom (0,5 µm por pixel; o recorte tem cerca de 112 µm de lado). A mesma barra aparece no quiz.
- **Ícones:** Lucide (`lucide-react` 0.460.0), sem emoji.
- **Acessibilidade (WCAG 2.2 AA):** contrastes recalculados (Seção 4.3 do projeto); borda dos campos e grupos de controles com pelo menos 3:1; atalhos de uma tecla do quiz só valem com o foco na página do quiz.

## Consequências
- Os tokens da Seção 4.3 do projeto e da Seção 2.2 do `CLAUDE.md` foram atualizados; as figuras do documento de gestão foram refeitas.
- O protótipo (`prototipo/`) continua com a identidade antiga: é o artefato validado na Sprint 0 e fica como registro.
- A tela do resultado mudou de leitura: o nome da classe vem primeiro, em destaque, e a sigla vira um selo. Os testes de usabilidade (EN06) avaliam a versão nova.
