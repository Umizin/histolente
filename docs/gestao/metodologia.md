# Metodologia de Desenvolvimento

## Escolha: Scrum adaptado a desenvolvedor individual, com quadro Kanban

O projeto adota o **Scrum** como processo de execução, em *sprints* de **duas semanas**, como previsto no Pré-TCC (Seção 2.3). O fluxo de tarefas dentro de cada sprint é visualizado num **quadro Kanban** (GitHub Projects) com limite de trabalho em andamento. A abordagem é, portanto, **híbrida**: Scrum dá a cadência e os eventos; Kanban dá a visualização e o controle do fluxo.

### Justificativa
1. **Alinhamento com o Design Science Research (DSR).** O DSR avança em ciclos de construção e avaliação do artefato. Cada sprint produz um incremento demonstrável e avaliável, o que dá ao trabalho científico pontos de verificação concretos.
2. **Incerteza técnica alta.** O desempenho do modelo, a latência do Grad-CAM e o comportamento com imagens fora do padrão só se conhecem experimentando. Ciclos curtos permitem ajustar o backlog a cada descoberta.
3. **Requisitos ainda em validação.** Parte dos requisitos depende das respostas da elicitação (marcados com †). O backlog priorizado absorve essas mudanças sem replanejar o projeto inteiro.
4. **Prazo acadêmico fixo.** Sprints com meta e revisão tornam o avanço visível para o orientador e permitem cortar escopo (itens *Could have*) se necessário.
5. **Kanban complementar.** Com uma única pessoa executando, o limite de trabalho em andamento evita abrir muitas frentes ao mesmo tempo, risco comum em projetos individuais.

## Relação com o Design Science Research

O processo de pesquisa segue a metodologia de *Design Science Research* de Peffers et al. (2007), em seis atividades, observando as diretrizes de Hevner et al. (2004). O Scrum (SCHWABER; SUTHERLAND, 2020) organiza a execução: cada *sprint* é uma iteração das atividades 3 a 5.

| Atividade DSR (PEFFERS et al., 2007) | Quando | Incremento | Evidência |
|---|---|---|---|
| 1. Identificação do problema e motivação | Até set./2026 | Pré-TCC | Pré-TCC; histórico do projeto |
| 2. Definição dos objetivos da solução | Sprint 0 | RF01–RF18, RNF01–RNF11, priorização com a elicitação (T5) | Documento de requisitos (v1.2) |
| 3. Projeto e desenvolvimento | Sprints 0 a 4 | Arquitetura, modelos, protótipo; contratos, ambiente, pipeline de ML; MVP | Documento de projeto; PRs #40–#42 em diante |
| 4. Demonstração | Sprints 1 a 4 | Protótipo navegável; depois, o MVP funcionando | Telas no documento de projeto; *deploy* |
| 5. Avaliação | Sprints 1 (formativa) e 5–6 (somativa) | Avaliação do protótipo; métricas do modelo; desempenho; SUS e estudo de caso | Relatórios de avaliação (a coletar) |
| 6. Comunicação | Contínua | Entregas da disciplina, monografia e defesa | PDFs e monografia |

## Adaptação dos papéis

| Papel do Scrum | Quem exerce | Observação |
|---|---|---|
| Product Owner | Autor, com validação do orientador | Prioridades revisadas com base na elicitação (T5) e nas reuniões de orientação |
| Scrum Master | Autor | Responsável por manter os eventos e remover impedimentos |
| Time de desenvolvimento | Autor | Apoio de ferramentas de IA generativa, sob revisão do autor |
| Stakeholders | Orientador, professores e estudantes de Medicina, profissionais de laboratório | Participam da validação dos incrementos |

## Eventos e artefatos

| Evento | Quando | Duração | Registro |
|---|---|---|---|
| Sprint Planning | 1º dia da sprint | até 1 h | `docs/gestao/sprints/sprint-NN.md`, seção Planning |
| Acompanhamento diário | dias de trabalho | 5 min | atualização do quadro (substitui a *daily* em equipe) |
| Sprint Review | último dia | até 1 h | seção Review da ata; demonstração ao orientador quando possível |
| Retrospectiva | último dia | 30 min | seção Retrospectiva da ata |

**Artefatos:** Product Backlog (`docs/engenharia-requisitos/`, Seção 4.3, espelhado no GitHub Projects), Sprint Backlog (coluna da sprint no quadro), Incremento (versão marcada com *tag* `sprint-NN` no Git).

## Estimativas
Os itens são estimados em *story points* na sequência de Fibonacci (1, 2, 3, 5, 8, 13), comparando cada item com uma história de referência (HU12, aviso ético = 1 ponto). Como o projeto tem um único desenvolvedor, não há sessão de *planning poker* com equipe: a estimativa é feita pelo autor e revisada ao fim de cada sprint, comparando o estimado com o realizado. A velocidade inicial assumida é de cerca de 20 pontos por sprint e será recalibrada após a Sprint 1.

## Definição de Pronto (DoD)
Um item só é considerado pronto quando:
- o código foi revisado num *pull request*;
- os testes automatizados do item passam na integração contínua;
- os critérios de aceite foram verificados;
- o aviso ético (RF07) está presente nas telas afetadas;
- a documentação e a seção correspondente da monografia foram atualizadas.

## Referências

HEVNER, Alan R. et al. Design science in information systems research. **MIS Quarterly**, v. 28, n. 1, p. 75-105, mar. 2004.

PEFFERS, Ken et al. A design science research methodology for information systems research. **Journal of Management Information Systems**, v. 24, n. 3, p. 45-77, 2007. Disponível em: https://doi.org/10.2753/MIS0742-1222240302.

SCHWABER, Ken; SUTHERLAND, Jeff. **The Scrum Guide**: the definitive guide to Scrum: the rules of the game. 2020. Disponível em: https://scrumguides.org/scrum-guide.html.
