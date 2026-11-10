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

> As imagens histológicas do protótipo são **ilustrações geradas por código**, não imagens reais do dataset. No MVP, a galeria usará *patches* do NCT-CRC-HE-100K.

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
- Mapas de calor usam as paletas *turbo* ou *viridis*, que são legíveis por daltônicos.

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
| Banner ético | Fixo no topo; pode ser minimizado, nunca removido (RF07) |
| Área de envio | Arrastar e soltar, clique ou Ctrl+V; valida antes de enviar |
| Visualizador | Zoom de 1× a 8× com a roda do mouse; arraste para mover; tecla `0` restaura |
| Controle de opacidade | 0–100% (padrão 40%); setas do teclado mudam de 5 em 5% |
| Barras de confiança | 9 barras ordenadas; classe sugerida em *teal*; *tooltip* morfológico |
| Alerta de baixa confiança | Âmbar, com ícone e texto (RN03) |
| Tabela de histórico | Paginada, com filtros e reabertura |

## 4.4 Critérios de acessibilidade (WCAG 2.2, nível AA)
| Critério WCAG | Como é atendido |
|---|---|
| 1.1.1 Conteúdo não textual | Imagens com texto alternativo; mapa de calor descrito pelo nome da classe e pela confiança |
| 1.4.1 Uso de cor | Classe sugerida e alertas também indicados por texto e ícone |
| 1.4.3 Contraste mínimo (4,5:1) | Todos os tokens de texto atingem pelo menos 6,9:1 sobre o fundo (valores calculados pela fórmula de luminância relativa da WCAG) |
| 1.4.11 Contraste de elementos não textuais (3:1) | Foco (7,8:1) e barras preenchidas atendem; campos e controles usam `--border-strong` (≥ 3,4:1). A borda decorativa `--border` (1,4:1) não é usada para identificar controles |
| 2.1.1 Teclado | Todas as funções têm atalho ou foco: `←/→` opacidade, `+/−` zoom, `0` reset, `S` lado a lado, `G` galeria |
| 2.4.7 Foco visível | Contorno *teal* de 2 px em todos os elementos focáveis |
| 2.4.11 Foco não encoberto | O banner fixo não cobre o elemento focado |
| 2.5.8 Tamanho do alvo (24 × 24 px) | Botões e controles com área clicável de pelo menos 24 px |
| 3.3.1 Identificação de erros | Erros de envio explicam a causa e como corrigir |
| 4.1.2 Nome, função e valor | Controle de opacidade com `aria-valuetext` ("Opacidade do mapa: 40%"); barras com rótulo textual |
| 2.3.3 Animação por interação | Respeita a configuração de reduzir movimento |

## 4.5 Validação do protótipo com usuários
**Situação:** planejada para a Sprint 0 ou 1. Os participantes serão as pessoas que deixaram contato no formulário de elicitação.

**Protocolo:**
1. Enviar o link do protótipo com o TCLE.
2. Pedir que o participante execute 4 tarefas:
   - analisar uma amostra da galeria;
   - ajustar a opacidade e usar o modo lado a lado;
   - responder uma questão do quiz;
   - reabrir uma análise do histórico.
3. Registrar, para cada tarefa: conclusão (sim/não), dificuldades e comentários.
4. Aplicar uma versão curta do SUS ao fim do teste.

**Registro dos resultados:** `[[RESULTADO A COLETAR]]`. Os ajustes decorrentes entram no backlog da sprint seguinte.
