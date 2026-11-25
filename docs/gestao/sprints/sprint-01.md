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

## Acompanhamento — 24/11/2026

Com EN01, EN02 e EN03 adiantados, itens da Sprint 2 foram puxados para montar o MVP antes da entrega de Gestão/Desenvolvimento (28/11). Mudança de escopo registrada aqui e no quadro (campo Sprint).

| Issue | Item | Pontos | Situação | PR |
|---|---|---|---|---|
| EN04 | Serviço de inferência | 8 | Em andamento (falta p95 no hardware de referência e modelos gerados dos contratos) | #48 |
| HU14 | Autenticar-se | 5 | Pronto | #48 |
| HU17 | Aceitar termo de uso | 3 | Pronto | #48 |
| HU01 | Enviar patch | 5 | Pronto | #48 |
| HU19 | Acompanhar a análise em tempo real (SSE) | 5 | Pronto | #48 |
| HU04 | Ver resultado e confiança | 5 | Pronto | #48 |
| HU12 | Aviso ético permanente | 1 | Pronto | #48 |
| HU02, HU06, HU08, HU22 | Galeria, baixa confiança, lado a lado, imagem fora do padrão | — | Em revisão | #50 |
| — | CI/CD: publicação no GHCR e composição de produção | — | Em revisão | #49 |

Bug encontrado no teste manual: mensagem fora do contrato travava o serviço de inferência (sem ack com prefetch=1). Corrigido no #48, com teste.

## Acompanhamento — 25/11/2026

Implantação da demonstração numa VPS com HTTPS (#52). No primeiro teste com uma imagem de fora do dataset (recorte de mucosa colônica de um atlas, com coloração mais pálida), o modelo sugeriu BACK com 99,1% e o alerta de imagem fora do padrão não disparou. O experimento mostrou que a causa era a coloração, não a escala: com a cor normalizada pelo método de Macenko, a sugestão de BACK desaparece. Esse é o risco R01 acontecendo na prática.

Mudança de escopo, registrada também no quadro:

| Issue | Item | Situação |
|---|---|---|
| — | Alerta de coloração fora do padrão, com limiar por classe, e sugestão com a cor ajustada só informativa (ADR 0005). Normalizar a cor de todas as imagens foi testado e descartado: a acurácia no CRC-VAL-HE-7K caiu de 96,6 % para 93,2 % | Pronto (#53) |
| HU13 | Praticar em modo quiz (antecipada da Sprint 5): banco de 45 imagens do CRC-VAL-HE-7K, correção no servidor e explicação "por que não é" | Pronto (#53) |
| — | Identidade visual "Platina" (ADR 0006): fontes, ícones, barra de escala em µm no visualizador, tema claro para projetor, contrastes revisados | Pronto (#55) |
| — | "Como ler este mapa": descrição medida da região de maior influência do Grad-CAM (posição, área, hematoxilina, eosina e espaço claro), sem afirmar o raciocínio do modelo | Pronto (#57) |
| — | Entrega de gestão organizada pelo roteiro; implantação automática no CD (primeira execução em 25/11); repositório público com a `main` protegida | Pronto (#58, #59) |

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
