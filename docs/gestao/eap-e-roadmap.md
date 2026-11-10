# EAP e Roadmap de Sprints

## 1. Estrutura Analítica do Projeto (EAP)

```
TCC — Workstation de Patologia Digital
├── 1 Gerenciamento do projeto
│   ├── 1.1 Metodologia e planejamento
│   ├── 1.2 Gestão de riscos
│   ├── 1.3 Gestão de configuração (Git, quadro, CI)
│   └── 1.4 Eventos de sprint e atas
├── 2 Pesquisa e monografia
│   ├── 2.1 Referencial teórico
│   ├── 2.2 Materiais e métodos
│   ├── 2.3 Elementos pré e pós-textuais (resumo, introdução, conclusão)
│   ├── 2.4 Ética (TCLE, CEP, LGPD)
│   └── 2.5 Defesa (apresentação e ensaio)
├── 3 Engenharia de requisitos
│   ├── 3.1 Elicitação (T1–T8)
│   ├── 3.2 Especificação (RF, RNF, histórias, casos de uso)
│   └── 3.3 Rastreabilidade
├── 4 Projeto (design)
│   ├── 4.1 Arquitetura
│   ├── 4.2 Modelagem estrutural e comportamental (classes, sequência)
│   ├── 4.3 Modelagem de dados (MER, lógico, físico, dicionário)
│   ├── 4.4 UX/UI (guia de estilo, wireframes, protótipo navegável)
│   └── 4.5 Segurança e LGPD
├── 5 Modelo de IA
│   ├── 5.1 Preparação dos dados e divisão treino/validação/teste
│   ├── 5.2 Treinamento e seleção da arquitetura CNN
│   ├── 5.3 Grad-CAM
│   └── 5.4 Avaliação (métricas no conjunto de teste independente)
├── 6 Desenvolvimento do MVP
│   ├── 6.1 Infraestrutura (Docker Compose)
│   ├── 6.2 Serviço de inferência
│   ├── 6.3 Backend de orquestração (API, SSE, mensageria, persistência)
│   └── 6.4 Frontend (workstation)
├── 7 Qualidade e entrega
│   ├── 7.1 Testes automatizados
│   ├── 7.2 CI/CD
│   └── 7.3 Deploy
└── 8 Validação
    ├── 8.1 Testes funcionais
    ├── 8.2 Testes de desempenho
    ├── 8.3 Usabilidade (SUS)
    └── 8.4 Estudo de caso (entrevistas)
```

## 2. Roadmap de sprints

Sprints de duas semanas, começando em 10/11/2026. As datas a partir da Sprint 3 dependem do calendário acadêmico e do prazo de entrega final, ainda a confirmar.

| Sprint | Período | Meta da sprint | Itens principais (EAP / backlog) | Pontos |
|---|---|---|---|---|
| S0 | 10/11 – 23/11/2026 | Base do projeto e design | 1.1–1.3; 4.1–4.5 (classes, sequência, dados, guia de estilo, protótipo); consolidação da elicitação | — (preparação) |
| S1 | 24/11 – 07/12/2026 | Modelo treinado e ambiente rodando | EN01, EN02, EN03 | 21 |
| S2 | 08/12 – 21/12/2026 | Fluxo central de ponta a ponta | EN04, HU14, HU01, HU19, HU04, HU12 | 29 |
| — | recesso de fim de ano | `[[confirmar com o calendário da UVS]]` | — | — |
| S3 | `[[a definir]]` | Explicabilidade e galeria | HU07, HU02, HU05, HU10 | 19 |
| S4 | `[[a definir]]` | Robustez e conformidade | HU08, HU06, HU18, HU17, HU15, HU22 | 23 |
| S5 | `[[a definir]]` | Recursos pedagógicos e carga | HU13, HU03, EN05 | 18 |
| S6 | `[[a definir]]` | Validação com usuários e itens opcionais | EN06, HU20, HU21, HU11, HU09, HU16 | 23 |

**Marcos:**
- fim da S2: MVP com o fluxo central (enviar, classificar, ver resultado);
- fim da S4: versão completa para os testes de usabilidade;
- fim da S6: validação concluída e capítulo de Resultados.
