---
description: Sabatina simulada — os 4 avaliadores da banca analisam o arquivo/diretório, dão nota 0–10 cada e geram perguntas de defesa com gabarito
argument-hint: <arquivo-ou-diretório> (ex.: docs/monografia/04-arquitetura.md ou services/inference)
allowed-tools: Read, Grep, Glob, Bash, Agent
---

# /banca-sabatina — Sabatina da Banca Avaliadora

**Alvo:** `$ARGUMENTS`

Se `$ARGUMENTS` estiver vazio, use `docs/TCC_Pré_ (1).pdf` como alvo. Se o alvo for PDF, extraia com `pdftotext -layout "<arquivo>" <scratchpad>/alvo.txt` e trabalhe sobre o texto. Se for diretório, liste os arquivos relevantes (código, `.md`, `docker-compose.yml`, `Dockerfile`, schemas) e foque nos que representam o núcleo do módulo.

## Passo 1 — Preparação
1. Leia `CLAUDE.md` (raiz) por completo.
2. Leia o alvo integralmente. Identifique o tipo: (a) texto da monografia; (b) código frontend; (c) backend/infra; (d) ML/treino; (e) misto.
3. Monte um resumo de contexto (≤ 15 linhas) com: o que o alvo é, quais RF/RNF toca, quais seções da monografia correspondem.

## Passo 2 — Avaliação paralela pelos 4 avaliadores
Dispare **em paralelo**, com a ferramenta Agent, os 4 subagentes abaixo, passando a cada um: o caminho do alvo, o resumo de contexto do Passo 1 e a instrução "siga seu formato de saída obrigatório; não edite arquivos":
- `banca-orientador-metodologico`
- `banca-engenharia-software`
- `banca-ia-visao-computacional`
- `banca-clinico-pedagogico`

Mesmo que o alvo pareça fora da especialidade de um avaliador (ex.: Dockerfile para o clínico), ele deve avaliar o que lhe cabe (ex.: impacto ético/pedagógico, ou declarar "fora de escopo — sem penalidade" com nota justificada).

## Passo 3 — Consolidação (você, como secretário da banca)
Produza o relatório final em Markdown, nesta ordem:

### 1. Quadro de notas
| Avaliador | Nota (0–10) | Justificativa (1 linha) |
|---|---|---|
| Orientador Metodológico (Presidente) | | |
| Engenharia de Software | | |
| IA & Visão Computacional | | |
| Clínico-Pedagógico | | |
| **Média** | | |

### 2. Falhas críticas (bloqueiam aprovação)
Lista deduplicada e ordenada por severidade: `# | Dimensão (Metodologia/Arquitetura/IA/UX/Clínica/Ética/ABNT) | Local | Falha | Correção concreta | Esforço (P/M/G)`.

### 3. Falhas altas e médias
Mesma tabela, resumida.

### 4. Pontos fortes
3–6 itens que o candidato deve destacar na defesa.

### 5. Quatro perguntas difíceis de defesa oral (uma por avaliador)
Para cada uma:
- **Avaliador:** ...
- **Pergunta:** (formulada como a banca formularia, direta e incisiva)
- **Por que a banca pergunta isso:** (a fragilidade exposta)
- **Gabarito — resposta excelente (≈ 120–200 palavras):** em 1ª pessoa do candidato, citando autores/requisitos/evidências do projeto. Se a evidência ainda não existe, o gabarito deve indicar o que precisa ser produzido antes da defesa.
- **Armadilha a evitar:** o que NÃO dizer.

### 6. Plano de ação priorizado
Checklist `- [ ]` com as próximas ações (máx. 10), indicando o comando ou agente que resolve cada uma (`/auditar-abnt`, `/refinar-requisitos-arquitetura`, `/gerar-artefatos-pesquisa`, `/prototipar-workstation-ui`, `/sincronizar-codigo-tcc`).

## Regras
- Não edite nenhum arquivo; este comando é somente avaliação.
- Seja severo e específico (cite seção/linha). Notas sem justificativa não são aceitas.
- Não invente evidências, números ou referências; quando faltar evidência, isso é um achado.
- Se itens do checklist da seção 6 do `CLAUDE.md` ainda estiverem pendentes no alvo, inclua-os nos achados.
