# Sprint 0 — Base do projeto e design

**Período:** 10/11/2026 a 16/11/2026 (planejada até 23/11; encerrada antes porque a meta foi atingida)
**Participantes:** Paulo Victor Silva Gonçalves (PO, SM e desenvolvimento); orientador Tiago Castro na Review, se disponível.

---

## Sprint Planning — 10/11/2026

**Meta da sprint:** deixar o projeto pronto para começar o desenvolvimento, com repositório e quadro configurados, riscos mapeados, projeto (design) documentado e elicitação consolidada.

**Contexto de entrada:**
- Documento de requisitos concluído (17 RF, 9 RNF, 22 histórias, 15 casos de uso).
- Formulário de elicitação enviado aos participantes.
- Monografia convertida para Markdown, com os Capítulos 1 a 4.

**Sprint Backlog:**

| # | Item | EAP | Estado no planning |
|---|---|---|---|
| 1 | Repositório Git, `.gitignore`, README, estratégia de branches e padrão de commits | 1.3 | Concluído em 10/11 |
| 2 | Repositório remoto no GitHub e GitHub Projects com o backlog | 1.3 | Concluído (repositório em 10/11; issues em 10/11; quadro em 16/11) |
| 3 | Metodologia, EAP, roadmap e matriz de riscos | 1.1, 1.2 | Concluído em 10/11 |
| 4 | Diagrama de classes e diagramas de sequência dos fluxos principais | 4.2 | Concluído em 10/11 (`docs/projeto/02-…`) |
| 5 | MER, modelo lógico, modelo físico (SQL) e dicionário de dados | 4.3 | Concluído em 10/11 (`docs/projeto/03-…`, `infra/db/schema.sql`) |
| 6 | Guia de estilo, critérios WCAG e protótipo navegável | 4.4 | Guia e protótipo concluídos em 10/11; validação com usuários pendente |
| 7 | Seção de segurança e LGPD | 4.5 | Concluído em 10/11 (`docs/projeto/05-…`) |
| 8 | Consolidar as respostas da elicitação (Seção 1.4) e revisar o MoSCoW | 3.1 | Concluído em 16/11 (4 respostas; RF17 → Must, RF15 → Should, novo RF18) |
| 9 | Confirmar com o orientador: CEP, política de uso de IA, prazos | 2.4 | Parcial: orientador aprovou o andamento; CEP, uso de IA e prazos ainda sem resposta |

**Riscos observados no planning:** R04 (poucas respostas), R05 (CEP) e R06 (escopo).

---

## Sprint Review — 16/11/2026

**Meta atingida:** sim. Repositório, quadro, riscos e todo o pacote de design estão prontos, e a elicitação foi consolidada.

| Item | Concluído? | Observação |
|---|---|---|
| 1. Repositório, branches e commits | Sim | GitHub privado; CI inicial verde |
| 2. GitHub e quadro do Projects | Sim | 39 issues, 7 marcos, quadro com colunas do processo |
| 3. Metodologia, EAP, roadmap, riscos | Sim | — |
| 4. Classes e sequências | Sim | — |
| 5. Modelagem de dados | Sim | `schema.sql` testado no PostgreSQL 16 e na CI |
| 6. Guia de estilo e protótipo | Parcial | Validação do protótipo com usuários volta para o backlog (Sprint 1) |
| 7. Segurança e LGPD | Sim | — |
| 8. Consolidação da elicitação | Sim | 4 respostas; RF17 → Must, RF15 → Should, novo RF18 |
| 9. Pontos com o orientador | Parcial | Orientador aprovou o trabalho sem pedir mudanças; CEP, uso de IA e prazos continuam abertos |

**Feedback do orientador:** gostou do trabalho e não pediu alterações. A priorização segue a regra da Seção 2 do documento de requisitos, que combina as lacunas do Pré-TCC, o resultado do formulário e os riscos técnicos.

## Retrospectiva — 16/11/2026
- **O que funcionou bem:**
  - Documentação com fonte única: requisitos e apêndices da monografia não divergem.
  - O formulário teve respostas em dois dias.
- **O que pode melhorar:**
  - Nenhum professor respondeu ao formulário.
  - Configurações do GitHub (permissões do token, plano) atrasaram o quadro e a proteção da `main`.
- **Ações para a próxima sprint:**
  - Convidar professores diretamente para validar o protótipo.
  - Todo código entra por *pull request* com CI.
  - Perguntar ao orientador, por escrito, sobre CEP, uso de IA e prazo final.

**Velocidade:** não aplicável (sprint de preparação).
