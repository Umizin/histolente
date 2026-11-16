# Sprint 1 — Modelo treinável e ambiente rodando

**Período:** 16/11/2026 a 29/11/2026 (antecipada em uma semana, porque a Sprint 0 terminou antes)
**Participantes:** Paulo Victor Silva Gonçalves (PO, SM e desenvolvimento).

---

## Sprint Planning — 16/11/2026

**Meta da sprint:** ter o pipeline de treino e avaliação do modelo pronto e testado, o ambiente de infraestrutura subindo com um comando e o contrato de mensagens entre backend e inferência definido.

**Sprint Backlog:**

| Issue | Item | Pontos | Branch |
|---|---|---|---|
| EN03 | Contrato JSON das mensagens `inference.request` / `inference.completed` | 3 | `feat/EN03-contratos` |
| EN02 | `docker-compose` com Postgres, Redis e RabbitMQ (inferência e web entram junto com EN04 e HU01) | 5 | `feat/EN02-compose` |
| EN01 | Pipeline de treino e avaliação do modelo | 13 | `feat/EN01-pipeline-treino` |
| — | Validar o protótipo com usuários (veio da Sprint 0) | — | — |
| — | Treinar o primeiro modelo no Google Colab (GPU) com o NCT-CRC-HE-100K e avaliar no CRC-VAL-HE-7K | — | — |

**Total planejado:** 21 pontos.

**Decisões do planning:**
- O ambiente local não tem GPU (6 núcleos, 15 GB de RAM). O código de treino é testado na CI com um conjunto sintético pequeno, e o treino real roda no Google Colab.
- A ordem de execução é EN03 → EN02 → EN01, porque o contrato orienta os outros dois.

**Riscos acompanhados:** R01 (imagens fora do padrão), R02 (vazamento entre treino e teste) e R03 (latência em CPU).

---

## Sprint Review — `[[data]]`

| Item | Concluído? | Observação |
|---|---|---|
| | | |

## Retrospectiva — `[[data]]`
- **O que funcionou bem:**
- **O que pode melhorar:**
- **Ações:**

**Velocidade:** `[[pontos concluídos]]` de 21 planejados.
