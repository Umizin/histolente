# Mapa da Entrega

Onde cada item do roteiro da entrega de Gestão e Desenvolvimento está neste documento e no repositório.

| Item do roteiro | Onde está | Evidência no repositório |
|---|---|---|
| **1. Metodologia de desenvolvimento** (Scrum, Kanban ou híbrida, com justificativa) | Cap. 1: abordagem híbrida (Scrum com quadro Kanban), justificativa, relação com o *Design Science Research*, papéis, eventos e Definição de Pronto | `docs/gestao/metodologia.md` |
| **2. Planejamento:** EAP | Cap. 2, Seção 1 | `docs/gestao/eap-e-roadmap.md` |
| **2. Planejamento:** cronograma ou roadmap de sprints | Cap. 2, Seção 2 (replanejado em 25/11/2026) | idem |
| **2. Planejamento:** estimativas | Cap. 1, "Estimativas" (*story points* em Fibonacci; sem *planning poker* por ser um desenvolvedor só) e backlog com pontos no documento de requisitos (Seção 4.3) | `docs/engenharia-requisitos/` |
| **3. Gestão de riscos** (probabilidade × impacto e plano de resposta) | Cap. 3: 12 riscos com P, I, exposição, estratégia, plano de resposta e gatilho; matriz de exposição; revisões (R01 ocorreu e foi tratado em 25/11) | `docs/gestao/riscos.md` |
| **3. Gestão de configuração:** Git e estratégia de branches | Cap. 4, Seções 1 e 2 (GitHub Flow, variação leve do *trunk-based*) | https://github.com/Umizin/histolente/branches |
| **3. Gestão de configuração:** padrão de commits e pull requests com *code review* | Cap. 4, Seções 3 e 4 (Conventional Commits; todo trabalho entra por PR com CI verde) | https://github.com/Umizin/histolente/pulls?q=is%3Apr |
| **3. Gestão de configuração:** quadro de tarefas | Cap. 4, Seção 5 (GitHub Projects, com campos Sprint, Pontos e Prioridade) | https://github.com/users/Umizin/projects/1 |
| **4. Atas e relatórios de sprint** (planning, review, retrospectiva) | Cap. 5 (Sprint 0: planning, review e retrospectiva) e Cap. 6 (Sprint 1: planning e acompanhamentos; review e retrospectiva em 29/11/2026, fim da sprint) | `docs/gestao/sprints/` |
| **5. Desenvolvimento do MVP:** funcionalidades priorizadas e implementadas | Cap. 7, Seções 1 a 4 e 6 (escopo, arquitetura, testes, telas, modelo treinado e avaliado) | `apps/`, `services/`, `ml/` |
| **5. Desenvolvimento do MVP:** boas práticas (Clean Code, SOLID, padrões de projeto) | Cap. 7, Seção 5 (organização em camadas, SOLID, padrões, testes e dívida técnica declarada) | ADRs em `docs/adr/` |
| **6. CI/CD** (pipeline automatizado de build, testes e deploy) | Cap. 8, Seção 1 | https://github.com/Umizin/histolente/actions |
| **7. Deploy:** aplicação publicada | Cap. 8, Seção 2: **https://189-24-15-186.sslip.io** | `infra/docker-compose.prod.yml` |
| **7. Deploy:** link do repositório | **https://github.com/Umizin/histolente** (privado; acesso por convite) | — |

O capítulo 9 traz o histórico do projeto desde o Pré-TCC.
