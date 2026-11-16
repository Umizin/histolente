# Gestão de Riscos

**Escalas:**
- **Probabilidade (P):** 1 = baixa · 2 = média · 3 = alta
- **Impacto (I):** 1 = baixo · 2 = médio · 3 = alto
- **Exposição = P × I:** 1–2 baixa · 3–4 média · 6–9 **alta**

Revisão a cada Sprint Review; riscos com exposição alta são acompanhados como item do quadro.

| ID | Risco | Categoria | P | I | Exp. | Estratégia | Plano de resposta | Gatilho de monitoramento |
|---|---|---|---|---|---|---|---|---|
| R01 | Desempenho do modelo cai em imagens de outras fontes (fotos de celular, outras colorações), por diferença em relação ao dataset de treino. **Confirmado na elicitação (16/11): 3 de 4 participantes usariam fotos de celular** | Técnico (IA) | 3 | 3 | **9** | Mitigar | Testar no conjunto independente e em imagens fora do padrão; implementar o aviso do RF17; avaliar normalização de coloração; declarar como limitação | Queda de acurácia > 10 p.p. entre conjunto de validação e imagens externas |
| R02 | Métricas infladas por vazamento de dados entre treino e teste (patches da mesma lâmina nos dois conjuntos) | Técnico (IA) | 2 | 3 | **6** | Evitar | Usar conjunto de teste independente, com pacientes distintos; documentar a divisão dos dados | Acurácia de teste acima de 99% |
| R03 | Latência acima do SLA (p95 > 1,5 s) em máquina sem GPU | Técnico | 2 | 2 | 4 | Mitigar | Escolher arquitetura CNN leve; medir cedo (Sprint 1); usar cache; limitar concorrência por fila | Benchmark da Sprint 1 |
| R04 | Poucas respostas na elicitação ou nos testes de usabilidade. **Ocorreu em parte (16/11): 4 respostas e nenhum professor** | Pesquisa | 3 | 3 | **9** | Mitigar | Divulgar por mais canais (turmas, professores, grupos); aceitar amostra pequena justificada; usar as pessoas que deixaram contato no formulário | Menos de 5 respostas em 2 semanas |
| R05 | Necessidade de aprovação do CEP atrasar a coleta | Ética / prazo | 2 | 3 | **6** | Mitigar | Confirmar com o orientador já na S0; se exigido, submeter cedo e planejar a coleta de usabilidade para depois da aprovação | Resposta da coordenação |
| R06 | Escopo maior que a capacidade de um desenvolvedor individual | Gestão | 3 | 2 | **6** | Mitigar | Priorização MoSCoW; cortar itens *Could* primeiro; MVP fechado no fim da S2 | Velocidade real < 70% da planejada por 2 sprints |
| R07 | Complexidade da arquitetura distribuída (RabbitMQ, Redis, SSE) atrasar o MVP | Técnico | 2 | 2 | 4 | Mitigar | Começar pelo fluxo central de ponta a ponta na S2; usar Docker Compose desde a S1 | Fluxo de ponta a ponta não funcionando ao fim da S2 |
| R08 | Indisponibilidade de hospedagem gratuita com recursos suficientes para o serviço de IA | Infraestrutura | 2 | 2 | 4 | Mitigar | Modelo leve em CPU; avaliar opções de nuvem gratuitas ou institucionais; plano B: demonstração local com Docker | Teste de deploy na S3 |
| R09 | Usuários interpretarem a sugestão do modelo como diagnóstico | Ético / clínico | 1 | 3 | 3 | Evitar | Aviso permanente (RF07), linguagem sem termos de laudo (RN04), alerta de baixa confiança (RN03) | Achados nas entrevistas e testes de usabilidade |
| R10 | Vazamento de dados de participantes | LGPD | 1 | 3 | 3 | Evitar | Formulário anônimo; respostas fora do Git (`.gitignore`); armazenamento local protegido | Revisão a cada coleta |
| R11 | Perda de trabalho (falha de máquina) | Operacional | 1 | 3 | 3 | Mitigar | Repositório remoto no GitHub com push frequente | Commits sem push por mais de 2 dias |
| R12 | Divergência entre o texto da monografia e o sistema implementado | Qualidade | 2 | 2 | 4 | Mitigar | Atualizar a monografia como parte da Definição de Pronto; revisão de coerência a cada sprint | Sprint Review |

## Matriz de exposição

| Probabilidade \ Impacto | 1 — baixo | 2 — médio | 3 — alto |
|---|---|---|---|
| **3 — alta** | | R06 | **R01, R04** |
| **2 — média** | | R03, R07, R08, R12 | **R02, R05** |
| **1 — baixa** | | | R09, R10, R11 |

## Revisões
- **16/11/2026:** R01 confirmado pela elicitação; RF17 (aviso de imagem fora do padrão) passou a *Must*. R04 subiu para P = 3, porque nenhum professor respondeu ao formulário. Ação: convidar diretamente os professores de Patologia, por meio do orientador, para a validação do protótipo.
