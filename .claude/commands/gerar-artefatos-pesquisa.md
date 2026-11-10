---
description: Gera TCLE (CEP/CONEP + LGPD), roteiros de entrevista semiestruturada (professores e alunos de Medicina), questionário SUS em PT-BR e script Python de tabulação do score
argument-hint: [tcle|roteiro|sus|todos] (padrão: todos)
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Agent
---

# /gerar-artefatos-pesquisa

**Argumentos:** `$ARGUMENTS` (padrão `todos`)

Saída em `docs/pesquisa/`. Todos os documentos em português formal, prontos para revisão do orientador e, se aplicável, submissão à Plataforma Brasil. Campos que dependem de informação ainda desconhecida ficam como `[[PREENCHER: ...]]` — **nunca inventar** nome de orientador, CAAE, telefone, e-mail do CEP ou endereço.

## Passo 0 — Contexto
Leia `CLAUDE.md` (seções 0, 3 — RNF02/RNF04 —, 5) e o Pré-TCC, Seções 2.4–2.6 (validação em 4 etapas; amostra por conveniência; TCLE; LGPD; CEP a confirmar).

## Artefato 1 — `docs/pesquisa/TCLE.md`
Estrutura conforme Res. CNS nº 466/2012 (item IV.3) e nº 510/2016 (arts. 15 a 17) e LGPD (Lei nº 13.709/2018). Linguagem clara, 2ª pessoa ("você"), sem jargão técnico. Seções:
1. Cabeçalho: título da pesquisa; pesquisador responsável (Paulo Victor Silva Gonçalves, discente de Engenharia de Software — UVS Maricá); orientador `[[PREENCHER]]`; instituição; CAAE `[[PREENCHER ou "não aplicável — justificar"]]`.
2. Convite e justificativa (escassez de patologistas; ferramenta educacional).
3. Objetivos da pesquisa.
4. Procedimentos: o que o participante fará (uso da ferramenta ~15–20 min com tarefas; questionário SUS ~5 min; entrevista ~20–30 min com **gravação de áudio somente com consentimento específico**), local, duração total.
5. Riscos (mínimos: cansaço, desconforto, constrangimento, quebra acidental de sigilo) e **medidas de minimização** (pausas, liberdade de não responder, pseudonimização, armazenamento cifrado, acesso restrito).
6. **Relação hierárquica**: declarar que a participação não afeta notas/avaliações; o pesquisador não tem relação de avaliação com participantes; professores não terão acesso às respostas identificadas dos alunos.
7. Benefícios (indiretos: contribuição ao ensino de patologia; diretos: contato com ferramenta educacional).
8. Voluntariedade, recusa e retirada a qualquer momento, sem penalidade.
9. Sigilo e privacidade + **bloco LGPD**: controlador, finalidade específica, base legal (consentimento — art. 7º, I e art. 11, II, "c" para estudos por órgão de pesquisa quando aplicável → marcar `[[VERIFICAR com orientador]]`), dados coletados (lista mínima), pseudonimização (códigos P01, A01...), armazenamento, prazo de retenção (ex.: 5 anos após o término, conforme Res. 466/2012 — **verificar**), descarte, direitos do titular (art. 18), contato.
10. Ressarcimento e indenização (Res. 466/2012).
11. Esclarecimento: a ferramenta não realiza diagnóstico (Res. CFM nº 2.454/2026); nenhuma imagem de paciente será usada (dataset público anonimizado NCT-CRC-HE-100K).
12. Contatos do pesquisador e do CEP `[[PREENCHER]]`.
13. Consentimento: caixas separadas — ( ) concordo em participar; ( ) concordo com a gravação de áudio; ( ) desejo receber os resultados. Assinaturas, data, **duas vias** (ou via digital com cópia ao participante).
Acrescentar `docs/pesquisa/TCLE-checklist.md` com cada elemento obrigatório e onde aparece.

## Artefato 2 — `docs/pesquisa/roteiro-entrevista.md`
Dois roteiros (Professores de Patologia; Estudantes de Medicina), cada um com:
- Orientações ao entrevistador (abertura, leitura do TCLE, permissão de gravação, neutralidade, tempo estimado 20–30 min, encerramento).
- Blocos e perguntas abertas, não indutoras, com *probes* (aprofundamentos):
  - **A. Perfil** (período/tempo de docência, experiência com microscopia e com IA) — sem dados identificáveis.
  - **B. Ensino/aprendizagem de histopatologia** (maiores dificuldades em diferenciar tecidos; pares que mais confundem; recursos usados hoje).
  - **C. Uso da ferramenta** (após tarefas): clareza da classificação, utilidade das barras de confiança, dos tooltips, da galeria e do modo quiz.
  - **D. Explicabilidade (Grad-CAM)**: o que o participante entende do mapa; se o slider/side-by-side ajudaram; casos em que o mapa pareceu sem sentido.
  - **E. Confiança e riscos**: viés de automação, dependência, o que deveria ser mostrado para confiar/desconfiar.
  - **F. Ética e regulação**: percepção do aviso CFM; limites de uso em sala e na prática.
  - **G. Sugestões** e fechamento.
- Tarefas do teste de usabilidade (roteiro para a etapa SUS): T1 analisar amostra da galeria; T2 fazer upload de um patch; T3 ajustar opacidade do Grad-CAM e comparar lado a lado; T4 diferenciar STR × MUS usando tooltips; T5 reabrir uma análise do histórico. Registrar sucesso, tempo e erros.
- Plano de análise: Análise de Conteúdo (Bardin) ou análise temática (Braun e Clarke, 2006) — **citar somente após verificação**; categorias iniciais a priori (dificuldade, utilidade, compreensão, confiança, ética) e emergentes; critério de saturação.

## Artefato 3 — `docs/pesquisa/questionario-SUS.md`
- Instruções e escala Likert 1 (Discordo totalmente) a 5 (Concordo totalmente).
- 10 itens SUS em PT-BR, mantendo a alternância positivo/negativo do original (Brooke, 1996), adaptados para "esta ferramenta". Indicar a fonte da tradução utilizada `[[VERIFICAR tradução validada PT-BR e citá-la]]`:
  1. Eu acho que gostaria de usar esta ferramenta com frequência.
  2. Eu achei a ferramenta desnecessariamente complexa.
  3. Eu achei a ferramenta fácil de usar.
  4. Eu acho que precisaria do apoio de uma pessoa com conhecimentos técnicos para usar a ferramenta.
  5. Eu achei que as diversas funções da ferramenta estavam bem integradas.
  6. Eu achei que havia muita inconsistência na ferramenta.
  7. Eu imagino que a maioria das pessoas aprenderia a usar esta ferramenta rapidamente.
  8. Eu achei a ferramenta muito complicada (pesada) de usar.
  9. Eu me senti muito confiante ao usar a ferramenta.
  10. Eu precisei aprender muitas coisas antes de conseguir usar a ferramenta.
- Bloco de perfil não identificável (código do participante, papel aluno/professor, período/faixa de experiência).
- 2 perguntas abertas opcionais (o que mais ajudou; o que mais atrapalhou).
- Versão para Google Forms/Microsoft Forms: lista de campos com tipo de resposta.

## Artefato 4 — `docs/pesquisa/sus_score.py` (+ `docs/pesquisa/exemplo_respostas.csv` com dados **sintéticos claramente rotulados como exemplo**)
Script Python 3.11, type hints, sem dependências exóticas (pandas, numpy, scipy, matplotlib):
- Entrada: CSV com colunas `participant_id, role, q1..q10` (valores 1–5).
- Validação: valores fora de 1–5 ou ausentes → erro com linha indicada.
- Cálculo por participante: ímpares `r-1`, pares `5-r`, soma × 2,5.
- Estatísticas globais e por `role`: n, média, desvio-padrão, mediana, mín., máx., **IC 95%** (t de Student; e bootstrap 10.000 se n ≥ 5).
- Classificação adjetiva e faixa de aceitabilidade segundo Bangor, Kortum e Miller (2009) — implementar as faixas como constantes comentadas com a fonte e `# VERIFICAR limites no artigo original`.
- Comparação com metas do projeto: 68 (média de referência) e 85 (meta RNF02).
- Saídas: `sus_resultados.csv` (score por participante), `sus_resumo.md` (tabela pronta para a monografia, ABNT: título acima, "Fonte: dados da pesquisa (2026)"), `sus_boxplot.png` (por perfil, tema neutro).
- CLI: `python -I sus_score.py respostas.csv --out docs/pesquisa/resultados/`.
- Testes `docs/pesquisa/test_sus_score.py` (pytest): todas respostas 3 → 50; ímpares 5/pares 1 → 100; ímpares 1/pares 5 → 0; validação de entrada.
Execute os testes e o script com o CSV de exemplo; relate a saída real.

## Passo final
1. Acione `banca-orientador-metodologico` para revisar TCLE e roteiros (somente achados CRÍTICOS/ALTOS) e `banca-clinico-pedagogico` para revisar a linguagem do roteiro e as tarefas. Incorpore correções.
2. Liste os arquivos gerados e todos os `[[PREENCHER]]`/`[[VERIFICAR]]` pendentes.
3. Sugira a seção da monografia (2.5/2.6 e Apêndices A–C) onde cada artefato entra.
