---
description: Reescreve RF/RNF (com critérios de aceite mensuráveis) e a Seção 4 da monografia para a arquitetura Next.js + orquestração + worker desacoplado com SSE, gerando diagramas Mermaid (fluxo, sequência, C4 contêiner, DER)
argument-hint: [arquivo-alvo] [--aplicar]  (padrão: docs/monografia/03-requisitos.md e 04-arquitetura.md; ou o Pré-TCC)
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Agent
---

# /refinar-requisitos-arquitetura

**Argumentos:** `$ARGUMENTS`

Alvo: `docs/monografia/03-requisitos.md` e `docs/monografia/04-arquitetura.md` se existirem; senão, extrair Capítulos 3 e 4 do Pré-TCC (`docs/TCC_Pré_ (1).pdf`, `pdftotext -layout`). Com `--aplicar`, gravar os resultados nesses arquivos `.md` (criando-os se necessário) e os diagramas em `docs/diagramas/*.mmd`. Sem `--aplicar`, apenas apresentar a proposta.

## Passo 1 — Diagnóstico
1. Leia `CLAUDE.md` (seções 1, 3 e 6 — itens C3, C5, C5b, A8, A9, A12).
2. Liste divergências entre o texto atual e a arquitetura-alvo. Divergências já conhecidas no Pré-TCC:
   - 2.7 e 4.2: "Vue 3 ou Next.js (a definir)" → Next.js.
   - 4.3: o serviço de inferência "grava o desfecho" no PostgreSQL e consulta o Redis diretamente → **contradiz RNF06**; deve ser reescrito.
   - Ausência de SSE, de filas nomeadas, de cache SHA-256, de DLQ.
   - RNF01 sem métrica; numeração "2.4" no lugar de "3.4".
   - Figura 1 desatualizada (sem conteúdo no PDF extraído).
3. Se houver código em `apps/`, `services/`, `infra/`, verificar se a arquitetura descrita corresponde à implementada (grep por filas, endpoints, envs). Divergência código × texto deve ser reportada.

## Passo 2 — Requisitos (Seções 3.3 e 3.4)
Reescreva no padrão ISO/IEC/IEEE 29148 ("O sistema deve..."), um requisito por linha, mantendo os IDs RF01–RF07 e RNF01–RNF06 (não renumerar — rastreabilidade com o Pré-TCC). Use os critérios do `CLAUDE.md` §3.

Tabela RF: `ID | Requisito | Critério de aceite | Prioridade (MoSCoW) | Origem (lacuna 1.8 / dataset / entrevista / CFM) | Verificação (teste)`.
Tabela RNF: `ID | Categoria (ISO/IEC 25010) | Requisito | Métrica/SLA | Método de medição | Origem`.
- RNF01: worker p95 < 500 ms; ponta a ponta via SSE p95 < 1,5 s (patch isolado); cache hit p95 < 150 ms; 30 usuários simultâneos; hardware de referência declarado.
- RNF06: worker sem acesso ao PostgreSQL; comunicação apenas via RabbitMQ; versionamento independente do modelo.
Gere também a **Matriz de Rastreabilidade**: `Lacuna (1.8) → RF/RNF → Componente → Teste → Etapa de validação (funcional/desempenho/SUS/estudo de caso)`.

Requisitos novos que surgirem (ex.: autenticação/perfis, falha de job) entram como **RF08+ / RNF07+ propostos**, marcados para aprovação do autor — não inserir silenciosamente.

## Passo 3 — Diagramas Mermaid (prontos para `docs/diagramas/`)
Gere os 4, consistentes entre si e com `CLAUDE.md` §1:
1. `fluxo-event-driven-sse.mmd` — `flowchart LR` com os 3 domínios em `subgraph`, RabbitMQ (`inference.request`, `inference.completed`, DLQ), Redis (cache/estado/PubSub), PostgreSQL ligado **apenas** ao backend, seta tracejada "SEM ACESSO" do worker ao Postgres, numeração dos passos.
2. `sequencia-analise.mmd` — `sequenceDiagram` com `alt cache hit / cache miss`, SSE (`EventSource`), ack, e `opt falha → retry → DLQ → event: failed`.
3. `c4-container.mmd` — `C4Container` (ou `flowchart` estilizado se o renderizador não suportar C4): Pessoa (Estudante, Professor), Sistema (Workstation), Contêineres (Web Next.js, API/SSE, Worker, RabbitMQ, Redis, PostgreSQL, Storage de imagens, Pipeline de treino offline), tecnologias e protocolos (HTTPS, SSE, AMQP 0-9-1, RESP, SQL).
4. `der-postgresql.mmd` — `erDiagram` com USERS, IMAGES, MODEL_VERSIONS, BATCHES, ANALYSES, CONSENTS (atributos, PK/FK, cardinalidades) conforme `CLAUDE.md` §1.7.

Valide a sintaxe: se `npx -y @mermaid-js/mermaid-cli` estiver disponível (pedir permissão antes de instalar), renderize para SVG em `docs/diagramas/`; senão, revise manualmente palavras reservadas e aspas.

## Passo 4 — Prosa acadêmica da Seção 4
Acione o subagente `sub-redator-academico` com o diagnóstico, os requisitos e os diagramas para reescrever:
- **4.1 Visão geral** — três domínios, estilo arquitetural orientado a eventos, justificativa (RNF01, RNF05, RNF06), ligação com Sommerville (2019) e Pressman e Maxim (2016) sobre arquitetura e separação de responsabilidades; Zehra et al. (2023) para baixo custo/CPU.
- **4.2 Componentes** — um parágrafo por componente: Frontend Next.js (App Router, SSE, viewer, Grad-CAM interativo, banner CFM); Backend de Orquestração (validação, SHA-256, persistência exclusiva, publicação/consumo, SSE); RabbitMQ (filas, durabilidade, DLQ, prefetch como controle de carga contra OOM); Redis (cache por hash + versão do modelo, estado transitório, Pub/Sub); Worker FastAPI + PyTorch (consome, infere, Grad-CAM, publica; **sem acesso ao banco**); Módulo Grad-CAM (Selvaraju et al., 2017); PostgreSQL (rastreabilidade com `model_version`); Pipeline offline (Kather et al., 2018; 2019); Docker Compose (RNF03, redes segregadas).
- **4.3 Fluxo de dados** — narrativa passo a passo referenciando a Figura de sequência, incluindo cache hit, cache miss, falha/DLQ e reconexão SSE.
- **4.4 Decisões arquiteturais (novo, proposto)** — quadro de ADRs: Next.js vs Vue; SSE vs WebSocket vs polling; Base64 no evento vs storage compartilhado; persistência centralizada vs worker com banco.
Figuras como "Figura N — Título" + "Fonte: elaborado pelo autor (2026)."

## Passo 5 — Revisão cruzada
Acione `banca-engenharia-software` para revisar a proposta (somente achados CRÍTICOS/ALTOS). Incorpore as correções.

## Saída
1. Diagnóstico (tabela de divergências).
2. Tabelas RF/RNF reescritas + matriz de rastreabilidade.
3. 4 diagramas Mermaid em blocos de código.
4. Texto das Seções 4.1–4.4.
5. Requisitos novos propostos (para aprovação).
6. Com `--aplicar`: lista de arquivos criados/alterados e itens do checklist (`CLAUDE.md` §6) marcados como `[x]`.

## Regras
- Não renumerar IDs existentes; não remover requisitos sem aprovação.
- Não inventar métricas obtidas; SLAs são metas, resultados são `[[A COLETAR]]`.
- Manter coerência total entre texto, diagramas e `CLAUDE.md`. Se o autor decidir algo diferente, atualizar o `CLAUDE.md` também.
