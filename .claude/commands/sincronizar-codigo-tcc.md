---
description: Lê o código implementado de um módulo e redige/atualiza a seção correspondente da monografia (Desenvolvimento, Arquitetura ou Resultados) com explicações, tabelas de métricas e diagramas
argument-hint: <módulo-ou-caminho> (ex.: services/inference, apps/web/components/viewer, ml/training, infra)
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Agent
---

# /sincronizar-codigo-tcc

**Módulo:** `$ARGUMENTS`

Se vazio, pergunte qual módulo sincronizar, listando os diretórios existentes em `apps/`, `services/`, `ml/`, `infra/`, `packages/`.

## Passo 1 — Leitura técnica do módulo
1. Leia `CLAUDE.md` (seções 1, 3, 4, 5, 8).
2. Mapeie o módulo: árvore de arquivos, pontos de entrada, dependências (package.json / pyproject), configuração, testes, Dockerfile.
3. Extraia fatos verificáveis (cite `arquivo:linha` para cada um):
   - Responsabilidade do módulo e domínio arquitetural (Apresentação / Orquestração / ML / Infra).
   - RF/RNF atendidos (cruze com `CLAUDE.md` §3 e com nomes de testes).
   - Decisões de projeto visíveis no código (padrões, bibliotecas, contratos, filas, chaves Redis, schema).
   - Testes existentes: rode-os (`npm test`, `pytest`, etc.) se o ambiente permitir; registre resultado real (passou/falhou, cobertura).
   - Métricas disponíveis: `ml/reports/**` (JSON/PNG), resultados k6, benchmarks. **Somente valores existentes em arquivos.**
   - ADRs relacionados em `docs/adr/`.
   - Divergências entre código e `CLAUDE.md`/monografia (ex.: worker com env de banco → violação RNF06).
4. Produza um **dossiê técnico** (bullet points com evidências) — é a única fonte que o redator poderá usar.

## Passo 2 — Destino na monografia
Defina o capítulo/seção-alvo conforme o tipo do módulo:
| Módulo | Seção sugerida |
|---|---|
| `apps/web/**` | Desenvolvimento → Camada de Apresentação (interface, componentes, acessibilidade, design system) |
| `apps/api/**` / route handlers | Desenvolvimento → Orquestração (API, SSE, persistência, mensageria) |
| `services/inference/**` | Desenvolvimento → Serviço de Inferência e Explicabilidade |
| `ml/training/**`, `ml/reports/**` | Desenvolvimento → Treinamento do Modelo; Resultados → Desempenho do Classificador |
| `infra/**` | Desenvolvimento → Implantação e Containerização |
| testes de carga/k6 | Resultados → Desempenho do Sistema (RNF01) |
Verifique `docs/monografia/` para o arquivo existente correspondente; se não existir, proponha o nome (`05-desenvolvimento.md`, `06-resultados.md`) e a numeração coerente com os capítulos existentes.

## Passo 3 — Redação
Acione o subagente `sub-redator-academico` com: o dossiê técnico, a seção-alvo, o texto atual dessa seção (se houver) e as instruções:
- Estrutura: objetivo do módulo e requisitos atendidos → decisões e alternativas (com ADR) → funcionamento (referenciando Figura/Quadro) → implementação (Quadro de código ≤ 15 linhas só se essencial) → testes e evidências → limitações.
- Para Resultados: tabelas ABNT (título acima, "Fonte: elaborado pelo autor (2026)" abaixo) com métricas reais; valores ausentes `[[RESULTADO A COLETAR]]`; comparação com literatura somente no mesmo protocolo.
- Diagramas Mermaid quando agregarem (componentes do módulo, sequência específica); salvar em `docs/diagramas/`.
- Conectar ao referencial teórico (ver mapa de fundamentação do redator).
- Se a seção já existe: atualizar mantendo a voz do autor, mudar só o necessário, apresentar diff.

## Passo 4 — Verificação
1. Confira que **todo** fato técnico no texto existe no dossiê (sem alucinação). Remova o que não tiver evidência.
2. Rode a verificação de citações do `/auditar-abnt` sobre o trecho novo (citação ↔ referência, ano).
3. Para módulos de ML, acione `banca-ia-visao-computacional` em modo rápido (só achados CRÍTICOS) sobre o texto de Resultados.

## Saída
1. Dossiê técnico (resumo com `arquivo:linha`).
2. Seção redigida/atualizada (e caminho do arquivo gravado).
3. Diagramas gerados.
4. Pendências: `[FONTE PENDENTE]`, `[[RESULTADO A COLETAR]]`, divergências código × texto e testes falhando.
5. Itens do checklist `CLAUDE.md` §6 afetados.

## Regras
- Nunca descrever funcionalidade não implementada como implementada; se planejada, usar futuro e marcar "(planejado)".
- Nunca alterar código neste comando; apenas documentação.
