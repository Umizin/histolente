# Metodologia de Desenvolvimento

## Escolha: Scrum adaptado a desenvolvedor individual, com quadro Kanban

O projeto adota o **Scrum** como processo de execução, em *sprints* de **duas semanas**, como previsto no Pré-TCC (Seção 2.3). O fluxo de tarefas dentro de cada sprint é visualizado num **quadro Kanban** (GitHub Projects) com limite de trabalho em andamento. A abordagem é, portanto, **híbrida**: Scrum dá a cadência e os eventos; Kanban dá a visualização e o controle do fluxo.

### Justificativa
1. **Alinhamento com o Design Science Research (DSR).** O DSR avança em ciclos de construção e avaliação do artefato. Cada sprint produz um incremento demonstrável e avaliável, o que dá ao trabalho científico pontos de verificação concretos.
2. **Incerteza técnica alta.** O desempenho do modelo, a latência do Grad-CAM e o comportamento com imagens fora do padrão só se conhecem experimentando. Ciclos curtos permitem ajustar o backlog a cada descoberta.
3. **Requisitos ainda em validação.** Parte dos requisitos depende das respostas da elicitação (marcados com †). O backlog priorizado absorve essas mudanças sem replanejar o projeto inteiro.
4. **Prazo acadêmico fixo.** Sprints com meta e revisão tornam o avanço visível para o orientador e permitem cortar escopo (itens *Could have*) se necessário.
5. **Kanban complementar.** Com uma única pessoa executando, o limite de trabalho em andamento evita abrir muitas frentes ao mesmo tempo, risco comum em projetos individuais.

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
