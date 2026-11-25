# EAP e Roadmap de Sprints

## 1. Estrutura Analítica do Projeto (EAP)

```
TCC — HistoLente
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

**Replanejamento de 25/11/2026.** A Sprint 1 antecipou o MVP e itens previstos para as Sprints 2 a 5 (ver a ata da Sprint 1). Somando os itens concluídos, são 63 pontos até 25/11. O restante do backlog foi redistribuído e o plano passou de seis para quatro sprints, mantendo os itens *Could* no fim, para sair primeiro se faltar capacidade.

| Sprint | Período | Meta da sprint | Itens principais (EAP / backlog) | Pontos |
|---|---|---|---|---|
| S0 | 10/11 – 16/11/2026 (encerrada antes) | Base do projeto e design | 1.1–1.3; 4.1–4.5 (classes, sequência, dados, guia de estilo, protótipo); consolidação da elicitação | — (preparação) |
| S1 | 16/11 – 29/11/2026 | Modelo treinável e ambiente rodando; ampliada para o MVP | Planejados: EN01, EN02, EN03 (21). Puxados: EN04, HU14, HU17, HU01, HU19, HU04, HU12, HU07, HU02, HU22, HU08, HU06, HU13 | 21 planejados |
| S2 | 30/11 – 13/12/2026 | Modelo final e fechamento do fluxo | EN01 (treino completo no Colab e comparação de dois *backbones*), EN04 (teste com GPU, tipos gerados dos contratos), HU10 (filtros por data e lote), HU05 (revisão por docente de Patologia), HU18, HU15, EN05 | 39 (EN01 e EN04 já parcialmente feitos) |
| — | recesso de fim de ano | datas a confirmar com o calendário da UVS | — | — |
| S3 | após o recesso (duas semanas) | Recursos para aula e itens opcionais | HU03, HU11, HU09, HU16, HU20 | 23 |
| S4 | duas semanas após a S3 | Validação com usuários | EN06 (SUS e entrevistas), HU21, HU23; capítulo de Resultados | 13 |

**Marcos:**
- fim da S2: MVP com o fluxo central (enviar, classificar, ver resultado). *Antecipado: entregue em 24/11/2026, ainda na S1, com itens das S2 a S4 (ver `sprints/sprint-01.md`);*
- fim da S2: modelo final (treino completo) avaliado no CRC-VAL-HE-7K;
- fim da S3: versão completa para os testes de usabilidade;
- fim da S4: validação concluída e capítulo de Resultados.
