---
description: Constrói ou refina a interface Next.js "Clinical Dark Workstation" (upload drag-and-drop, galeria 9 classes, visualizador com slider Grad-CAM, side-by-side com zoom/pan sincronizado, barras de confiança com tooltips histológicos, banner CFM) com revisão clínico-pedagógica
argument-hint: [componente|tela|"tudo"] (ex.: GradCamOverlay, galeria, "tudo")
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Agent
---

# /prototipar-workstation-ui

**Escopo:** `$ARGUMENTS` (padrão: `tudo` — a tela principal da workstation completa)

## Passo 0 — Estado atual
1. Leia `CLAUDE.md` (seções 0.4, 1.5, 2, 3, 4.2).
2. Verifique se `apps/web/` existe.
   - **Não existe:** proponha o scaffold e peça confirmação antes de rodar instaladores que baixam pacotes: `npx create-next-app@latest apps/web --ts --tailwind --eslint --app --src-dir --import-alias "@/*"`, depois `npx shadcn@latest init` e componentes `button slider tooltip tabs dialog table skeleton sonner toggle-group card badge scroll-area`, e `npm i framer-motion lucide-react zod zustand`. Ative `strict`, `noUncheckedIndexedAccess`.
   - **Existe:** mapeie componentes atuais e o que falta para o escopo pedido.
3. Enquanto o backend/worker não existirem, use uma **camada de mock** (`src/lib/api/mock.ts`) que imita exatamente o contrato `inference.completed` v1 (probabilidades + heatmap PNG gerado sinteticamente com gradiente gaussiano), com latência simulada de 300–900 ms e emissão via `EventSource` simulado — trocável pela API real por variável `NEXT_PUBLIC_API_MODE=mock|live`.

## Passo 1 — Conteúdo clínico (antes do código)
Acione o subagente `banca-clinico-pedagogico` para produzir/revisar `apps/web/src/lib/classes.ts`:
```ts
export const CLASSES = ["ADI","BACK","DEB","LYM","MUC","MUS","NORM","STR","TUM"] as const;
export type TissueClass = typeof CLASSES[number];
export const CLASS_INFO: Record<TissueClass, { name: string; short: string; criteria: string[]; pitfall: string; }> = { ... };
```
(nome PT-BR, descrição ≤ 280 caracteres, 2–3 critérios morfológicos, armadilha/diferencial). Também o texto do `EthicsBanner` e da explicação "O que é o mapa Grad-CAM?" e "O que significa confiança?".

## Passo 2 — Implementação
Acione o subagente `sub-arquiteto-fullstack-ml` com o escopo e o conteúdo clínico aprovado. Componentes (em `apps/web/src/components/workstation/`):

| Componente | Requisitos | Especificação mínima |
|---|---|---|
| `EthicsBanner` | RF07 | fixo no topo, âmbar dessaturado sobre `--surface-1`, ícone `ShieldAlert`, minimizável para 28px (estado em localStorage com try/catch), nunca removível, `role="note"` |
| `WorkstationShell` | — | grid 3 colunas (sidebar 280px / viewer flex / painel resultado 360px), responsivo: < 1024px empilha; tokens do `CLAUDE.md` §2.2 |
| `DropzoneUpload` | RF01 | drag-and-drop, clique, Ctrl+V; PNG/JPEG ≤ 5 MB; aviso não-224; modo lote ≤ 50 com lista e progresso; Optimistic UI |
| `SampleGallery` | RF01, RF02 | 9 miniaturas (1 por classe) em `public/samples/{CLASS}.png` + "aleatória"; 1 clique analisa; modo quiz: aluno escolhe a classe antes, depois vê acerto/erro e o resultado do modelo |
| `SlideViewer` | RF04 | zoom 1×–8× ancorado no cursor, pan, pinch, `pixelated` > 4×, minimapa opcional, botão reset, atalhos `+ - 0` |
| `GradCamOverlay` | RF04 | slider shadcn 0–100% (padrão 40%) aplicando `opacity` via ref (sem re-render); colormap turbo/viridis; modo contorno; seletor "mapa para a classe: [predita ▾]" |
| `SideBySide` | RF04 | dois `SlideViewer` com transform compartilhado (store), crosshair espelhado; toggle `Overlay | Lado a lado` (`S`) |
| `ConfidenceBars` | RF02, RF03 | 9 barras ordenadas, top-1 em `--accent`, `tabular-nums`, tooltip com `CLASS_INFO`, alerta de baixa confiança/margem, animação stagger |
| `JobStatus` | RNF01 | skeletons, estados QUEUED/PROCESSING/DONE/FAILED, cronômetro de latência, retry |
| `ModelInfo` | RF05, RNF06 | versão do modelo, hash curto, latência worker/e2e, cache hit; link "Sobre o modelo e limitações" |
| `AnalysisHistory` | RF05, RF06 | tabela paginada com filtro por classe/data/lote, reabrir análise |
| `useAnalysisStream` | RNF01 | hook SSE com Zod, backoff, cleanup |

Qualidade obrigatória:
- Tailwind + CSS variables; tema escuro padrão `#090D16`; acentos teal/emerald; **sem vermelho/rosa/roxo na UI**.
- Framer Motion 150–250 ms, `useReducedMotion`; nunca animar o patch.
- WCAG 2.2 AA; foco teal 2px; `aria-label`/`aria-valuetext` no slider ("Opacidade do mapa Grad-CAM: 40%").
- Nenhuma string com "diagnóstico"/"laudo" como saída do sistema (adicionar teste que busca essas palavras nos componentes de resultado).
- Componentes client mínimos; viewer carregado com `next/dynamic`.

## Passo 3 — Testes e execução
1. Vitest + Testing Library: `ConfidenceBars` (ordenação, soma 100%, alerta), `GradCamOverlay` (slider altera opacidade), `DropzoneUpload` (rejeita GIF/arquivo > 5 MB), `EthicsBanner` (presente e não removível).
2. Playwright (se configurado): fluxo galeria → resultado → slider → side-by-side; banner em todas as rotas.
3. Rode `npm run lint`, `npx tsc --noEmit`, `npm test` e `npm run build`; relate saídas reais.
4. Inicie `npm run dev` e, se houver ferramenta de navegador disponível, capture screenshots da workstation (estado vazio, carregando, resultado, side-by-side) em `docs/prints/` para a monografia e o teste de usabilidade.

## Passo 4 — Revisões
1. `banca-clinico-pedagogico`: revisar a UI resultante (tooltips, overlay não mascara morfologia, banner, linguagem). Somente achados CRÍTICOS/ALTOS são corrigidos neste ciclo.
2. `banca-engenharia-software`: revisar usabilidade (Nielsen), a11y e performance (INP do slider, LCP).
3. Aplicar correções; listar o restante como backlog.

## Saída
1. Arquivos criados/alterados (árvore).
2. Como rodar (`cd apps/web && npm run dev`, modo mock/live).
3. Resultado real de lint/type-check/testes/build.
4. Achados das revisões e o que foi corrigido.
5. Itens de backlog para a próxima sprint e resumo para `/sincronizar-codigo-tcc apps/web`.
