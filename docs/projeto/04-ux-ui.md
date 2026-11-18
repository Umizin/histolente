# 4. Design de Interface (UX/UI)

## 4.1 Conceito: "Clinical Dark Workstation"
Estação de trabalho escura, densa e silenciosa, em que **a lâmina é a protagonista**. A interface usa tons neutros escuros e acentos frios (*teal* e esmeralda) para não competir com o rosa da eosina e o roxo da hematoxilina, e para reduzir a fadiga visual em aulas longas.

## 4.2 Wireframes e protótipo navegável
- **Protótipo navegável:** [`prototipo/index.html`](../../prototipo/index.html). Abre direto no navegador, sem instalação, e todos os dados são simulados.
- As telas funcionam como wireframes de alta fidelidade:

| Tela | O que valida | Requisitos |
|---|---|---|
| Workstation — estado vazio | Primeiro contato; caminho para galeria e envio | RF01, RF07 |
| Workstation — análise em andamento | *Skeleton* e retorno de progresso | RNF01, HU19 |
| Workstation — resultado | Barras de confiança com *tooltips*, Grad-CAM com opacidade, modo lado a lado com zoom sincronizado, alerta de baixa confiança | RF02–RF04, RN03 |
| Galeria e quiz | Amostras por classe; quiz com erro explicado | RF01, RF09 |
| Histórico | Lista com filtros e reabertura | RF06 |
| Sobre o modelo | Versão, métricas e limitações | RF11 |

> As imagens histológicas do protótipo são **ilustrações geradas por código**, não imagens reais do dataset. No MVP, a galeria usará *patches* do CRC-VAL-HE-7K, que não foram usados no treino (RN09). O mapa de calor do protótipo também é simulado: os itens de compreensão da avaliação medem o conceito, não a qualidade do mapa.

### Telas do protótipo

**Figura 2 — Workstation no primeiro acesso (estado vazio)**

![Workstation no primeiro acesso (estado vazio)](figuras/telas/01-workstation-vazia.png)

Fonte: elaborado pelo autor (2026).

**Figura 3 — Resultado com alerta de baixa confiança, barras das 9 classes e Grad-CAM sobreposto**

![Resultado com alerta de baixa confiança, barras das 9 classes e Grad-CAM sobreposto](figuras/telas/02-resultado-baixa-confianca.png)

Fonte: elaborado pelo autor (2026).

**Figura 4 — Modo lado a lado: patch e mapa Grad-CAM com zoom sincronizado**

![Modo lado a lado: patch e mapa Grad-CAM com zoom sincronizado](figuras/telas/03-lado-a-lado.png)

Fonte: elaborado pelo autor (2026).

**Figura 5 — Galeria com amostras das 9 classes**

![Galeria com amostras das 9 classes](figuras/telas/04-galeria.png)

Fonte: elaborado pelo autor (2026).

**Figura 6 — Modo quiz: o estudante escolhe a classe antes de ver a resposta**

![Modo quiz: o estudante escolhe a classe antes de ver a resposta](figuras/telas/05-quiz.png)

Fonte: elaborado pelo autor (2026).

**Figura 7 — Histórico de análises com filtro e exportação CSV**

![Histórico de análises com filtro e exportação CSV](figuras/telas/06-historico.png)

Fonte: elaborado pelo autor (2026).

**Figura 8 — Sobre o modelo: versão e limitações**

![Sobre o modelo: versão e limitações](figuras/telas/07-sobre-o-modelo.png)

Fonte: elaborado pelo autor (2026).

**Figura 9 — Celular, com o painel do teste remoto recolhido**

![Celular, com o painel do teste remoto recolhido](figuras/telas/08-celular-modo-teste.png)

Fonte: elaborado pelo autor (2026).


## 4.3 Guia de estilo

### Cores
| Token | Valor | Uso | Contraste sobre `--bg` |
|---|---|---|---|
| `--bg` | `#090D16` | Fundo da aplicação | — |
| `--surface-1` | `#0F1420` | Painéis | — |
| `--surface-2` | `#161C2B` | Cards, popovers | — |
| `--border` | `#232A3B` | Divisórias decorativas (não identificam controles sozinhas) | 1,4:1 |
| `--border-strong` | `#64708A` | Borda de campos e controles interativos | 3,9:1 ✅ (3,4:1 sobre `--surface-2`) |
| `--text` | `#E6E9EF` | Texto principal | 16,0:1 ✅ |
| `--text-muted` | `#94A0B8` | Texto secundário | 7,4:1 ✅ |
| `--accent` | `#14B8A6` | Ação primária, foco, classe sugerida | 7,8:1 ✅ |
| `--accent-2` | `#10B981` | Sucesso, conclusão | 7,7:1 ✅ |
| `--warn` | `#F59E0B` | Aviso ético, baixa confiança | 9,0:1 ✅ |
| `--danger` | `#F97316` | Erro (laranja; nunca vermelho) | 6,9:1 ✅ |

**Regras de cor:**
- Nunca usar vermelho, rosa ou roxo como cor de interface, para não confundir com a coloração H&E.
- Toda informação transmitida por cor também aparece como texto ou ícone.
- O mapa de calor usa por padrão a paleta *viridis*, perceptualmente uniforme e legível por daltônicos, sem tons de rosa ou roxo no topo da escala; *turbo* fica como opção. Uma legenda "baixa → alta influência" acompanha o mapa, e o modo **contorno** mostra só as isolinhas de 50% e 75%, sem cobrir os núcleos.

### Tipografia
| Uso | Fonte | Tamanho / peso |
|---|---|---|
| Interface | Inter | 14 px (corpo), 12 px (secundário), 16–20 px semibold (títulos) |
| Números, percentuais, latências, *hashes* | JetBrains Mono | 13 px, `tabular-nums` |

### Espaçamento, formas e movimento
- Grade de 4 px; espaçamentos de 8, 12, 16 e 24 px.
- Raio de 8 px em cards e 6 px em campos.
- Bordas de 1 px; sem sombras pesadas.
- Animações de 150 a 250 ms, desativadas quando o usuário configurou o sistema para reduzir movimento (`prefers-reduced-motion`).
- A imagem histológica nunca é animada.

### Componentes
| Componente | Comportamento-chave |
|---|---|
| Banner ético | Fixo no topo: "Ferramenta educacional para estudo de padrões histológicos. Não substitui o exame anatomopatológico nem o laudo. A decisão clínica é sempre do médico". Minimizado, mantém "Não substitui laudo · decisão do médico"; nunca é removido (RF07; CONSELHO FEDERAL DE MEDICINA, 2026) |
| Área de envio | Arrastar e soltar, clique ou Ctrl+V; valida antes de enviar; orienta a enviar só o recorte de tecido, sem etiqueta ou dados de paciente (RN08); imagens maiores que 224 × 224 px são analisadas por recorte central, sem redução de escala (RN01) |
| Visualizador | Zoom de 1× a 8× com roda do mouse, botões + e − ou teclado; mover arrastando, pelos botões de seta ou com Shift+setas; tecla `0` restaura. Texto fixo sobre a escala (224 × 224 px ≈ 112 × 112 µm) e a resolução do mapa (≈ 7 × 7, ampliada) |
| Controle de opacidade | 0–100% (padrão 40%); setas do teclado mudam de 5 em 5% |
| Barras de confiança | 9 barras ordenadas; classe sugerida em *teal*; *tooltip* morfológico (fecha com Esc); texto fixo: "Confiança = probabilidade estimada pelo modelo entre as 9 classes, não certeza" |
| Alerta de baixa confiança | Âmbar, com ícone e texto, mostrando os critérios que diferenciam as duas classes mais prováveis (RN03) |
| Alerta de imagem fora do padrão | Aparece antes da classificação e oculta o mapa de calor, que pode ser reexibido pela opacidade (RF17) |
| Tabela de histórico | Paginada, com filtros e reabertura |

## 4.4 Critérios de acessibilidade (WCAG 2.2, nível AA)

Critérios da WCAG 2.2 (WORLD WIDE WEB CONSORTIUM, 2023) verificados no protótipo em 18/11/2026. A verificação automatizada com axe-core (RNF11, CT42) entra com o frontend definitivo.

| Critério WCAG | Como é atendido |
|---|---|
| 1.1.1 Conteúdo não textual | O *canvas* do *patch* tem `role="img"` e rótulo atualizado com a classe sugerida e a confiança |
| 1.4.1 Uso de cor | Classe sugerida e alertas também indicados por texto e ícone |
| 1.4.3 Contraste mínimo (4,5:1) | Todos os tokens de texto atingem pelo menos 6,9:1 sobre o fundo (valores calculados pela fórmula de luminância relativa da WCAG) |
| 1.4.11 Contraste de elementos não textuais (3:1) | Foco (7,8:1) atende; nas barras de confiança, o valor é sempre dado também em texto, e as barras são redundantes (a barra não sugerida tem 1,8:1 sobre a trilha e será clareada no frontend definitivo); campos e controles usam `--border-strong` (≥ 3,4:1). A borda decorativa `--border` (1,4:1) não é usada para identificar controles |
| 2.1.1 Teclado | Todas as funções são acessíveis por teclado: botões focáveis e, com o foco no visualizador, `←/→` opacidade, `+/−` zoom, Shift+setas mover, `0` restaurar, `S` lado a lado |
| 2.1.4 Atalhos de uma tecla | Os atalhos só funcionam com o foco no visualizador |
| 2.5.7 Movimentos de arrastar | Mover a imagem também é possível pelos botões de seta, sem arrastar |
| 1.4.13 Conteúdo em foco ou *hover* | Os *tooltips* aparecem no foco e no *hover* e fecham com Esc |
| 4.1.3 Mensagens de status | A conclusão da análise é anunciada uma única vez numa região `role="status"`; o cronômetro não é lido pelo leitor de tela |
| 2.4.7 Foco visível | Contorno *teal* de 2 px em todos os elementos focáveis |
| 2.4.11 Foco não encoberto | O banner fixo não cobre o elemento focado |
| 2.5.8 Tamanho do alvo (24 × 24 px) | Botões e controles com área clicável de pelo menos 24 px |
| 3.3.1 Identificação de erros | Erros de envio explicam a causa e como corrigir |
| 4.1.2 Nome, função e valor | Controle de opacidade com `aria-valuetext` ("Opacidade do mapa: 40%"); barras com rótulo textual |

**Critério adicional (nível AAA):** 2.3.3 Animação por interação — o protótipo respeita a configuração de reduzir movimento.

## 4.5 Validação do protótipo com usuários

**Formato:** teste de usabilidade **remoto e não moderado**. Os participantes moram em outro município, por isso não há sessão presencial nem gravação.

**Protocolo:**
1. O participante recebe dois links: o protótipo em modo de teste (`index.html?teste`) e o formulário de avaliação. O formulário é gerado por `docs/pesquisa/criar-formulario-avaliacao-prototipo.gs` e contém o TCLE.
2. No protótipo, um painel mostra as 4 tarefas, que o participante marca ao concluir:
   - analisar uma amostra rápida;
   - ajustar a opacidade, usar o lado a lado e o zoom;
   - responder no modo quiz;
   - reabrir uma análise do histórico.
   O botão do formulário só é liberado depois das 4 tarefas.
3. No formulário, o participante informa o resultado de cada tarefa (sem dificuldade / com dificuldade / não conseguiu) e o que aconteceu. Responde ainda a uma tarefa de diferenciação (estroma × músculo liso, com o critério usado), a itens de compreensão do mapa de calor e da confiança (verdadeiro ou falso), ao SUS completo (BROOKE, 1996) e a duas perguntas abertas.
4. O protótipo não envia dados: o registro das tarefas fica só no navegador do participante.

**Análise:**
- Taxa de conclusão autorrelatada por tarefa (indicador formativo; o critério "sem ajuda" do RNF02 só é medido na avaliação moderada).
- Meta de 8 a 12 participantes, adequada a uma avaliação formativa; com número menor, os resultados são apresentados só de forma descritiva.
- Escore SUS por participante, com média, desvio-padrão, mediana e IC 95%, calculado por Brooke (1996) e interpretado pela escala adjetiva de Bangor, Kortum e Miller (2009). A tradução dos itens para o português precisa ter fonte validada `[FONTE PENDENTE]`.
- Acertos nos itens de compreensão (o mapa não indica o tumor; confiança não é certeza).
- Resultados separados por aparelho (computador ou celular), já que a *workstation* foi projetada para telas largas.
- Dificuldades relatadas, convertidas em itens do backlog.

**Limitações:** sem observação direta, o teste depende do que o participante relata; não se mede o tempo das tarefas nem se vê onde a pessoa hesitou, e o critério "sem ajuda" do RNF02 só será medido na avaliação moderada. Esta aplicação é **formativa**, sobre um protótipo com dados simulados, e não substitui a avaliação final do RNF02 sobre o sistema funcional.

**Situação em 18/11/2026:** protocolo, protótipo com modo de teste e formulário prontos. **A aplicação ainda não começou**: ela depende do parecer escrito do orientador ou da coordenação sobre a necessidade de registro no CEP. Os resultados serão anexados a este documento ao fim da coleta.
