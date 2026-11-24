# 2 Materiais e Métodos

## 2.1 Paradigma metodológico

Este trabalho adota o pragmatismo como paradigma principal, coerente com o *Design Science Research*, que avalia o artefato pela utilidade na solução do problema (HEVNER et al., 2004). As métricas quantitativas de desempenho do modelo e a análise qualitativa das percepções dos usuários são instrumentos de avaliação subordinados a esse critério.

## 2.2 Classificação da pesquisa

Quanto à natureza, esta pesquisa caracteriza-se como aplicada, visto que objetiva gerar conhecimentos direcionados à aplicação prática e à solução de problemas específicos no cotidiano da patologia digital. Sob a ótica da abordagem do problema, o estudo configura-se como quanti-qualitativo, com predominância quantitativa, uma vez que a eficácia do modelo proposto é aferida por meio de métricas estatísticas de desempenho, enquanto a análise qualitativa se concentra na interpretação visual e clínica dos mapas de calor gerados.

No que concerne aos objetivos, a pesquisa assume caráter exploratório e descritivo, buscando detalhar o comportamento das redes neurais convolucionais diante do escopo de recursos computacionais restritos. Por fim, quanto aos procedimentos técnicos, o trabalho estrutura-se fundamentalmente como um desenvolvimento de produto, sendo metodologicamente precedido por uma revisão bibliográfica narrativa para a sustentação do referencial teórico e conceitual.

## 2.3 Metodologia adotada e organização do trabalho

A metodologia adotada combina o *Design Science Research* (DSR), na forma proposta por Peffers et al. (2007), como base científica do processo investigativo, com o Scrum (SCHWABER; SUTHERLAND, 2020) orientando a execução prática do desenvolvimento do artefato, em *sprints* de duas semanas, com entregas parciais ao final de cada ciclo. O processo de Peffers et al. (2007) tem seis atividades: identificação do problema e motivação; definição dos objetivos da solução; projeto e desenvolvimento; demonstração; avaliação; e comunicação. As duas primeiras correspondem ao Pré-TCC e ao levantamento de requisitos (Capítulo 3). Cada *sprint* é uma iteração das atividades de projeto e desenvolvimento, demonstração e avaliação. A comunicação é contínua, pelas entregas parciais e por esta monografia.

## 2.4 Levantamento de requisitos e validação da solução (método)

O levantamento de requisitos combina análise documental, análise da estrutura do *dataset* público utilizado e questionário online autoadministrado, dirigido a professores da disciplina de Patologia, estudantes de Medicina e profissionais de laboratórios de anatomia patológica, ao qual responderam três estudantes e um profissional de laboratório, conforme detalhado na Seção 3.1. A validação da solução será conduzida por meio de quatro partes: testes funcionais, testes de desempenho (métricas de classificação sobre conjunto de teste independente), testes de usabilidade (questionário System Usability Scale — SUS) e um estudo de caso com usuários reais. Não estão previstos, nesta etapa, testes em ambiente clínico real com patologistas em exercício, o que constitui limitação do trabalho.

## 2.5 População, amostra e instrumentos de coleta

Para os testes funcionais e de desempenho, não se aplica a definição de população e amostra, uma vez que a avaliação é conduzida sobre dados do *dataset* público e sobre o funcionamento do artefato. Para a elicitação de requisitos, a população-alvo é composta por professores de Patologia e estudantes de Medicina da instituição e por profissionais de laboratórios de anatomia patológica, com amostra definida por conveniência. Para o estudo de caso e os testes de usabilidade, a população-alvo é composta por professores e estudantes de Medicina da instituição, também com amostra por conveniência. Os instrumentos de coleta incluem formulário online de entrevista estruturada escrita (elicitação), roteiro de entrevista semiestruturada (estudo de caso), o questionário SUS, casos de teste documentados e ferramentas de medição de desempenho baseadas na biblioteca scikit-learn.

## 2.6 Conformidade ética: TCLE e LGPD

Os participantes de todas as etapas com pessoas registram consentimento por Termo de Consentimento Livre e Esclarecido (TCLE). Na etapa de elicitação, aplicada por formulário online, o TCLE é apresentado na primeira seção do próprio formulário, e somente os participantes que registram concordância têm acesso às perguntas; o formulário não coleta nome nem endereço de e-mail. O tratamento dos dados pessoais coletados seguirá os princípios da Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018). A etapa de elicitação foi aplicada antes de manifestação formal sobre a necessidade de registro no sistema CEP/Conep. O enquadramento na hipótese de pesquisa de opinião com participantes não identificados (Res. CNS nº 510/2016, art. 1º, parágrafo único, I) será submetido ao Comitê de Ética em Pesquisa da instituição. Até essa manifestação, os dados dessa etapa são tratados como exploratórios, e as etapas seguintes com participantes só serão aplicadas após o parecer.

## 2.7 Materiais

- **Dataset:** NCT-CRC-HE-100K, *dataset* público de imagens histológicas de câncer colorretal e tecido normal.
- **Linguagem de programação:** Python (serviço de inferência e treinamento) e TypeScript (interface e orquestração).
- **Framework de aprendizado profundo:** PyTorch.
- **Framework de API de inferência:** FastAPI.
- **Frontend:** Next.js (App Router, TypeScript) e Node.js 20; PostgreSQL 16, Redis 7 e RabbitMQ 3.13 orquestrados com Docker Compose.
- **Banco de dados:** PostgreSQL.
- **Mensageria:** RabbitMQ.
- **Cache:** Redis.
- **Containerização:** Docker e Docker Compose.
- **Coleta de dados de elicitação:** Google Forms.
- **Ambiente de desenvolvimento:** Cursor e Claude Code (ferramentas com assistência de inteligência artificial generativa).
