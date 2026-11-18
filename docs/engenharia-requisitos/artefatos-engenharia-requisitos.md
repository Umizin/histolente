# Artefatos de Engenharia de Requisitos

**Projeto:** Reconhecimento Automatizado de Padrões Histológicos em Câncer Colorretal com Inteligência Artificial: Uma Ferramenta de Apoio à Patologia Digital
**Autor:** Paulo Victor Silva Gonçalves — Engenharia de Software, Universidade de Vassouras (UVS), Campus Maricá
**Versão do documento:** 1.3 — 18/11/2026 (histórico de revisões ao final)
**Base:** Pré-TCC (set. 2026), análise do dataset NCT-CRC-HE-100K (KATHER et al., 2018), Resolução CFM nº 2.454/2026 (CONSELHO FEDERAL DE MEDICINA, 2026), LGPD (BRASIL, 2018) e decisões de arquitetura registradas no repositório do projeto.

> **Situação da elicitação.** As técnicas documentais (análise de literatura, de normas e do dataset) e as sessões de ideação já foram aplicadas. A **entrevista estruturada escrita**, aplicada remotamente via Google Forms com TCLE integrado, recebeu **4 respostas** entre 11 e 12/11/2026 e foi consolidada na Seção 1.5. Com amostra pequena e sem professores, a T5 **não confirma** requisitos: ela não refutou as hipóteses de RF09, RF15 e RF16, motivou a elevação do RF17 para *Must* (com base numa pergunta factual sobre a origem das imagens) e originou o RF18. A observação de aula, a validação de conteúdo por especialista e a validação do protótipo estão planejadas. Continuam marcados como **"a validar"** os requisitos que o formulário não cobriu (RF10, RF12 e HU09) e o RF18, sugerido por um único participante.

---

## Sumário
1. Técnicas de elicitação de requisitos
2. Requisitos funcionais (RF) — priorizados por MoSCoW
3. Requisitos não funcionais (RNF)
4. Histórias de usuário e Product Backlog
5. Modelagem UML de requisitos (casos de uso)
6. Matriz de rastreabilidade

---

## 1. Técnicas de elicitação de requisitos

### 1.1 Quadro de técnicas

| Cód. | Técnica | Status | Fonte / participantes | Evidência da aplicação | Requisitos originados |
|---|---|---|---|---|---|
| T1 | **Análise documental e revisão da literatura** | Aplicada (ago.–set./2026) | Sommerville (2019); Pressman e Maxim (2016); Litjens et al. (2017); Niazi, Parwani e Gurcan (2019); Zehra et al. (2023); Selvaraju et al. (2017); SBP (2025) | Capítulo 1 (Referencial Teórico) do Pré-TCC e lista de referências | RF02, RF04, RNF01, RNF03, RNF06, RNF08 |
| T2 | **Análise do dataset público** (estrutura, classes, formato) | Aplicada (set./2026) | NCT-CRC-HE-100K (KATHER et al., 2018): 100.000 *patches* H&E de 224 × 224 px, 9 classes | Seção 1.7 e RF02 do Pré-TCC; quadro das 9 classes com nomes e critérios morfológicos (Seção 2, RF02 e RF03) | RF01, RF02, RF03 |
| T3 | **Análise de normas e regulação** | Aplicada (set./2026) | Resolução CFM nº 2.454/2026; LGPD (Lei nº 13.709/2018) | Seções 1.6 e 2.6 do Pré-TCC | RF07, RF13, RNF04, RNF07 |
| T4 | **Ideação do pesquisador** | Aplicada (set.–nov./2026) | Autor, com apoio de ferramenta de IA generativa (uso declarado na monografia, conforme a política da instituição). As saídas foram tratadas como **hipóteses de requisitos**, sujeitas à validação por usuários | Histórico de decisões do projeto (`docs/gestao/historico-do-projeto.md`) e histórico de commits | RF09, RF10, RF11, RF12, RF14, RNF09 (todos **a validar**) |
| T5 | **Questionário online autoadministrado** (perguntas abertas + quadro de funcionalidades) | **Aplicada** (11–12/11/2026, n = 4) | 3 estudantes de Medicina e 1 profissional de laboratório; nenhum professor respondeu (amostra por conveniência) | Roteiro e formulário com TCLE (repositório do projeto, `docs/pesquisa/`); planilha de respostas pseudonimizadas, guardada fora do repositório; consolidação na Seção 1.5 | Validação dos RF "a validar"; priorização MoSCoW; novos requisitos |
| T6 | ~~Questionário separado~~ | Incorporado à T5 | — | O quadro de funcionalidades da T5 cumpre o papel de questionário fechado | — |
| T7 | **Observação** de aula prática de Patologia | Planejada (sujeita à autorização do professor) | Turma de Patologia da UVS | Roteiro de observação e notas de campo — `[[A COLETAR]]` | RF01 (lote), RF09, RNF02, RNF08 |
| T8 | **Prototipação** (protótipo navegável da *workstation*) | Protótipo construído (10/11/2026); validação com usuários planejada, condicionada ao parecer ético | Participantes da T5 e da T7 | Protótipo e capturas de tela no documento de Projeto; respostas da avaliação — `[[A COLETAR]]` | Refinamento de RF03, RF04 e RNF02 |
| T9 | **Validação de conteúdo por especialista** | Planejada | ≥ 2 docentes de Patologia ou patologistas | Checklist por classe (correção, completude, linguagem) com registro de concordância — `[[A COLETAR]]` | Conteúdo de RF03, RF09, RF15 (pré-requisito da HU05) |

### 1.2 Justificativa da combinação
A combinação segue a recomendação de Sommerville (2019): usar várias técnicas complementares, porque nenhuma técnica sozinha revela todos os requisitos. As técnicas documentais (T1–T3) definem o núcleo do problema e as restrições regulatórias. A ideação (T4) gera hipóteses de funcionalidades pedagógicas. As técnicas com usuários (T5–T8) validam essas hipóteses, priorizam o backlog e alimentam o ciclo de avaliação do Design Science Research.

### 1.3 Protocolo resumido das técnicas planejadas
- **T5 — Questionário online autoadministrado** (também chamado no roteiro de entrevista estruturada escrita): formulário online de cerca de 10 minutos, sem gravação e sem coleta de nome ou e-mail. O TCLE é apresentado na primeira página, e só quem aceita acessa as perguntas. Há um desvio por perfil (estudante, professor, profissional de laboratório), 6 perguntas abertas (dificuldades, tecidos confundidos, uso pretendido, mapa de calor, origem das imagens, condições de confiança) e um quadro com 6 funcionalidades classificadas como Essencial, Útil ou Dispensável. As respostas abertas foram sintetizadas por pergunta, com categorização dedutiva orientada pelo roteiro (inspirada na análise temática de Braun e Clarke, 2006); o quadro foi tabulado por frequência.
- **T7 — Observação:** observação não participante de uma aula prática de 50 minutos. Registro de tarefas, dificuldades e recursos usados, sem identificação de alunos.
- **Situação ética:** a T5 foi aplicada entre 11 e 12/11/2026, com aceite do TCLE, **antes de qualquer manifestação formal sobre a necessidade de registro no sistema CEP/Conep**. O enquadramento na hipótese de pesquisa de opinião com participantes não identificados (Res. CNS nº 510/2016, art. 1º, parágrafo único, I) será submetido à consulta do Comitê de Ética em Pesquisa da instituição, com o formulário tal como foi aplicado; a hipótese é enfraquecida pelo fato de os dados serem pseudonimizados, e não anônimos. Até essa manifestação, os dados da T5 são tratados como **exploratórios**, mantidos sob guarda, e nenhuma nova coleta é feita. Se o CEP entender necessário o registro, esses dados não serão usados na versão final, e nenhum requisito *Must* depende exclusivamente deles (critérios i e iii da Seção 2). As técnicas T7 a T9 só serão aplicadas após o parecer.
- **Ajuste de população:** a inclusão de profissionais de laboratório amplia a população descrita no Pré-TCC (Seção 2.5, só professores e estudantes). As Seções 2.5 e 3.1 devem ser atualizadas na monografia.

### 1.4 Relação com o processo de pesquisa (DSR)

Este documento corresponde à atividade 2 (definição dos objetivos da solução) do processo de *Design Science Research* de Peffers et al. (2007). As técnicas documentais e a ideação derivam do problema identificado no Pré-TCC (atividade 1); as técnicas com usuários (T5, T7 a T9) geram hipóteses que só são validadas na atividade 5 (avaliação do artefato). A correspondência completa entre atividades DSR e *sprints* está no documento de metodologia do projeto (`docs/gestao/metodologia.md`).

### 1.5 Consolidação das respostas da T5

**Participantes:** 4 respostas, todas com aceite do TCLE, coletadas entre 11 e 12/11/2026.

| Perfil | Respostas | Códigos |
|---|---|---|
| Estudantes de Medicina | 3 (todos do 6º período; 2 já cursaram Patologia, 1 está cursando) | E01, E02, E03 |
| Professores de Patologia | 0 | — |
| Profissionais de laboratório | 1 (setor administrativo de laboratório) | L01 |

**Quadro de funcionalidades** (frequência de respostas; nenhuma funcionalidade foi marcada como dispensável):

| Funcionalidade do quadro | Essencial | Útil | Dispensável | Decisão MoSCoW | Requisito |
|---|---|---|---|---|---|
| Confiança das 9 classes | 3 | 1 | 0 | Mantém *Must* | RF03 |
| Mapa de calor com transparência e lado a lado | 1 | 3 | 0 | Mantém *Must* pelo critério (i) da Seção 2 (núcleo da lacuna 3 do Pré-TCC) | RF04 |
| Critérios morfológicos e o que não confundir | **4** | 0 | 0 | Mantém *Must* (RF03). O item reunia RF03 e RF15, o que impede atribuir a frequência a cada um: **RF15 mantém *Could*** até a avaliação do artefato | RF03, RF15 |
| Galeria com vários exemplos por classe | 2 | 2 | 0 | Mantém *Must* pelo critério (i) (RF01, Pré-TCC) | RF01 |
| Quiz com erro explicado | 1 | 3 | 0 | Hipótese não refutada; mantém *Should* | RF09 |
| Histórico e acompanhamento de progresso | 2 | 2 | 0 | RF06 mantém *Should*; RF16 não refutado e mantém *Could* (o item juntava as duas coisas) | RF06, RF16 |

**Respostas abertas:**

| Tema | Síntese | Participantes | Impacto nos requisitos |
|---|---|---|---|
| Dificuldades atuais | Tecidos parecidos entre si porque "todos se coram de forma parecida"; dificuldade de lembrar os tecidos normais; qualidade da lâmina atrapalha (citada por 1 estudante; o profissional de laboratório repetiu o exemplo dado no enunciado) | 4 de 4 | Compatível com RF03 (critérios morfológicos) e RF01 (galeria com vários exemplos) |
| Tecidos mais confundidos | Músculo × estroma; mucosa normal × tumor; um participante citou tipos de leucemia, que estão fora do escopo | 3 de 4 | **Os pares citados coincidem com os exemplos dados no enunciado da pergunta**, o que impede tratá-los como evidência independente: o RF15 fica como hipótese não refutada, a ser avaliada com o artefato (taxa de acerto no quiz por par). A citação de leucemia mostra a necessidade de deixar claro o escopo (9 classes colorretais) |
| Uso pretendido | Estudar e treinar, inclusive antes da prova prática, em que a imagem é projetada na tela; o profissional de laboratório citou agilizar o trabalho | 4 de 4 | É compatível com o foco pedagógico (RF09, RF15); uso em projeção entra no RNF08; o uso na rotina laboratorial fica fora do escopo educacional |
| Mapa de calor | Todos responderam que ajudaria, principalmente quando a lâmina é ruim ou a estrutura é difícil de identificar | 4 de 4 | **Indica concepção equivocada do Grad-CAM e risco de viés de automação:** com lâmina ruim o modelo é menos confiável, e o mapa não localiza estruturas. Gera requisito de explicação na interface (RF03, RF04) e item de compreensão na avaliação do protótipo |
| Origem das imagens | Foto do microscópio pelo celular (3 de 4), lâmina digitalizada (2 de 4), atlas ou slide (1 de 4) | 4 de 4 | **RF17 sobe para *Must*:** a maioria enviaria fotos de celular, diferentes das imagens de treino (risco R01) |
| Condições de confiança | Não confundir estruturas; não deixar passar um tumor evidente; não errar áreas normais básicas; não indicar região errada de lesão; ser mais rápido que um aluno; identificar o tipo de material | 4 de 4 | Origina o RNF10 (desempenho mínimo do modelo, com sensibilidade de TUM e confusão NORM × TUM) e reforça o RNF01. "Não indicar região errada de lesão" **não pode ser atendido**: o Grad-CAM não localiza lesões e o *dataset* não tem anotação por pixel; isso é declarado na interface e nas limitações |
| Requisitos novos | Sugestão de "imagens erradas" para o aluno apontar o que foge do padrão normal | E02 | Novo **RF18** (*Could*, a validar) |

**Limitações da coleta:**
- Amostra pequena (n = 4), por conveniência e homogênea: os três estudantes são do 6º período (a disciplina é cursada antes, o que introduz viés de memória) e as respostas chegaram em menos de uma hora, o que sugere difusão num único grupo.
- O único profissional de laboratório atua em setor administrativo, sem leitura de lâminas: sua resposta tem baixa validade para conteúdo morfológico e é analisada à parte.
- **Nenhum professor respondeu.** Os requisitos e as histórias com persona docente (RF01 em lote, RF10, RF12; HU03, HU06, HU09, HU11, HU12, HU15) continuam como hipóteses do pesquisador e serão verificados na observação de aula (T7) e na validação por especialista (T9).
- **Viés de indução:** a pergunta 2 dava como exemplo os pares "músculo × estroma, mucosa normal × tumor"; a pergunta 1 sugeria aos profissionais que "a qualidade ou a coloração" atrapalha.
- **Viés de aquiescência:** num quadro sem custo de escolha, nenhuma das 24 marcações foi "Dispensável".
- Os resultados têm caráter exploratório e não permitem generalização. Numa próxima rodada: enunciados sem exemplos, ordem aleatória e ordenação forçada das funcionalidades.
- Os dados são **pseudonimizados**, não anônimos: não há nome nem e-mail, mas, com amostra pequena e registro de data e hora, a reidentificação não é impossível. Por isso a síntese usa contagens agregadas.

---

## 2. Requisitos funcionais (RF)

Prioridade pelo método **MoSCoW**: **M** = *Must have* (obrigatório para o MVP); **S** = *Should have* (importante, mas não bloqueia o MVP); **C** = *Could have* (desejável); **W** = *Won't have* (fora do escopo desta versão).
Os requisitos RF01–RF07 vêm do Pré-TCC. Os requisitos RF08–RF18 foram identificados depois e estão **propostos**.

**Regra de priorização.** A prioridade combina dois critérios: (i) aderência às lacunas do Pré-TCC, que define o núcleo *Must* do artefato (classificar, explicar, mostrar a confiança, avisar sobre o caráter educacional); (ii) frequência de marcação "Essencial" na T5, que pode promover ou rebaixar itens **fora** desse núcleo. Um terceiro critério cobre riscos: (iii) requisitos que impedem o uso enganoso do artefato, ligados a um risco técnico registrado na matriz de riscos (ex.: R01, imagens fora do padrão), podem ser promovidos a *Must* independentemente da frequência na T5. Requisitos *Must* pelos critérios (i) ou (iii) não são rebaixados por baixa frequência na T5, dada a amostra reduzida. O RF17 é *Must* pelo critério (iii).

| ID | Requisito | Prioridade | Origem | Critério de aceite |
|---|---|---|---|---|
| RF01 | O sistema deve permitir o envio de *patches* histológicos nos formatos PNG ou JPEG, individualmente, em lote ou pela galeria de amostras. | **M** | T2, T4 | Aceita PNG/JPEG de até 5 MB; rejeita outros formatos com mensagem explicativa; lote de até 50 imagens; galeria com várias amostras por classe, analisadas com 1 clique. |
| RF02 | O sistema deve classificar a imagem em uma das nove classes do NCT-CRC-HE-100K (ADI, BACK, DEB, LYM, MUC, MUS, NORM, STR, TUM). | **M** | T1, T2 | A classe sugerida pertence sempre ao conjunto das 9 classes; um conjunto-ouro fixo de imagens produz as mesmas probabilidades no serviço de inferência e no pipeline de treino (± 0,001), o que garante pré-processamento idêntico. O desempenho do modelo é aceito pelo RNF10, não por amostras isoladas. |
| RF03 | O sistema deve exibir o nível de confiança de cada uma das nove classes, com descrição morfológica de cada classe. | **M** | T2, T4 | Exibe 9 valores que somam 100% (± 0,5 p.p., por arredondamento), ordenados do maior para o menor; cada classe tem *tooltip* com critérios morfológicos; **um texto fixo explica que confiança é a probabilidade estimada pelo modelo entre as 9 classes, não certeza**, e informa a escala do recorte (224 × 224 px ≈ 112 × 112 µm). |
| RF04 | O sistema deve gerar e exibir o mapa de calor Grad-CAM sobreposto ao *patch*, com controle de opacidade e modo lado a lado. | **M** | T1 | Mapa de 224 × 224 px alinhado ao *patch*; opacidade de 0% a 100% (padrão 40%); modo lado a lado com zoom e deslocamento sincronizados; paleta padrão viridis (turbo como opção), sem tons de rosa ou roxo no topo da escala; legenda "baixa → alta influência"; modo contorno que não preenche a área; texto informando que o mapa tem resolução grosseira (≈ 7 × 7, ampliada) e não localiza lesões. |
| RF05 | O sistema deve armazenar o histórico das imagens processadas e seus resultados, incluindo a versão do modelo utilizada. | **M** | T1 | Cada análise registra probabilidades, mapa, versão do modelo, data e tempos de processamento. |
| RF06 | O sistema deve permitir ao usuário consultar e reabrir suas análises anteriores. | **S** | T1 | Lista paginada com filtros por classe, data e lote; reabrir uma análise reproduz a mesma visualização. |
| RF07 | O sistema deve exibir, em todas as telas, aviso de que os resultados têm caráter exclusivamente educacional e não substituem o exame anatomopatológico nem o laudo. | **M** | T3 | Aviso presente em 100% das telas autenticadas; pode ser minimizado, mas não removido. |
| RF08 *(proposto)* | O sistema deve autenticar usuários e controlar o acesso conforme o perfil (Estudante, Professor, Administrador). | **M** | T3 | Rotas protegidas exigem login; cada perfil acessa apenas as funções permitidas. |
| RF09 *(proposto; hipótese não refutada na T5)* | O sistema deve oferecer um modo quiz, no qual o estudante escolhe a classe da amostra antes de ver a sugestão do modelo e recebe explicação em caso de erro. | **S** | T4, T5 | O rótulo verdadeiro e a sugestão do modelo só aparecem depois da resposta; em caso de erro, exibe os critérios morfológicos que diferenciam a classe escolhida da correta. |
| RF10 *(proposto, a validar)* | O sistema deve permitir exportar o histórico de análises em formato CSV. | **C** | T4 | O arquivo CSV contém data, classe sugerida, confiança e versão do modelo de cada análise filtrada. |
| RF11 *(proposto)* | O sistema deve exibir a versão do modelo em uso e suas limitações conhecidas. | **S** | T3, T4 | A tela "Sobre o modelo" mostra versão, data de treino, métricas de teste e limitações. |
| RF12 *(proposto, a validar)* | O sistema deve permitir ao Administrador definir a versão ativa do modelo de classificação. | **C** | T4 | Trocar a versão ativa não exige recompilar o backend, e as novas análises registram a nova versão. |
| RF13 *(proposto)* | O sistema deve registrar o aceite do termo de uso (e do TCLE, para participantes da pesquisa) antes do primeiro uso. | **M** | T3 | Sem aceite registrado, a análise não é liberada; o aceite guarda versão do termo e data. |
| RF14 *(proposto)* | O sistema deve informar falhas no processamento e permitir o reenvio da análise. | **S** | T4 | Em caso de falha, o usuário recebe mensagem clara e um botão de reenvio, sem perder o *upload*. |
| RF15 *(proposto; hipótese não refutada na T5)* | O sistema deve permitir comparar, lado a lado, amostras de duas classes frequentemente confundidas (ex.: STR × MUS, NORM × TUM, DEB × LYM). | **C** | T4, T5 | O usuário escolhe um par de classes e vê amostras da galeria lado a lado, com os critérios que as diferenciam. |
| RF16 *(proposto; hipótese não refutada na T5)* | O sistema deve exibir ao estudante seu desempenho no modo quiz, por classe e ao longo do tempo. | **C** | T4, T5 | Painel com percentual de acertos por classe e evolução por sessão; dados visíveis apenas ao próprio estudante. |
| RF17 *(proposto)* | O sistema deve sinalizar como "fora do padrão" as imagens cujo escore de fora da distribuição exceda o limiar calibrado da versão do modelo (ex.: foto de celular, coloração diferente de H&E, pouco tecido, desfoque). | **M** | T1, T5 | **Método em duas camadas:** heurísticas de qualidade (fração de tecido, nitidez, estatísticas de cor H&E) e um escore do modelo (energia ou Mahalanobis nas ativações, com a probabilidade máxima como linha de base). **Limiar** fixado na validação para 95% de verdadeiros positivos nos dados do domínio, antes de usar o teste. **Aceite:** AUROC ≥ `[[definir]]` num conjunto rotulado de fotos de celular e outras colorações, e taxa de falso alarme no CRC-VAL-HE-7K ≤ 5%. O escore, o método e o limiar são gravados com a análise; o aviso aparece antes da classificação e o mapa Grad-CAM fica recolhido. |
| RF18 *(proposto, a validar)* | O sistema deve oferecer o desafio "Encontre o intruso": o estudante recebe um conjunto de amostras e aponta a que pertence a outro tecido (ex.: um *patch* de tumor entre *patches* de mucosa normal). | **C** | T5 | Grade com 4 a 6 amostras, sendo uma de classe diferente; a resposta e os critérios diferenciais só aparecem após a escolha. |

**Fora do escopo (Won't have nesta versão):**
- Análise de lâmina completa (*whole-slide imaging*).
- Emissão de diagnóstico ou laudo, vedada pela Res. CFM nº 2.454/2026.
- Integração com prontuário eletrônico ou sistema de informação laboratorial.
- Uso de imagens de pacientes reais identificáveis.
- Aplicativo móvel nativo.
- Re-treino do modelo pelo usuário final.
- Identificação ou segmentação de estruturas individuais (núcleo, matriz, célula específica). O Grad-CAM indica apenas regiões de influência na decisão, não rotula estruturas.
- Histologia geral fora das 9 classes de tecido colorretal (ex.: cartilagem, epitélios de outros órgãos).

---

## 3. Requisitos não funcionais (RNF)

Os requisitos RNF01–RNF06 vêm do Pré-TCC, agora com métricas verificáveis. Os requisitos RNF07–RNF11 foram **propostos** para cobrir segurança, compatibilidade, escalabilidade, qualidade do modelo e acessibilidade. As características seguem a ISO/IEC 25010 (INTERNATIONAL ORGANIZATION FOR STANDARDIZATION, 2011); disponibilidade é tratada como subcaracterística de confiabilidade e escalabilidade como capacidade, dentro de eficiência de desempenho.

| ID | Característica (base: ISO/IEC 25010:2011) | Requisito | Métrica / critério | Como medir |
|---|---|---|---|---|
| RNF01 | **Desempenho** (eficiência de desempenho) | O serviço de inferência e o sistema devem respeitar os tempos de resposta ao lado, medidos no hardware de referência declarado (máquina do laboratório, ociosa). | Serviço de inferência (pré-processamento + inferência + Grad-CAM): p95 < 500 ms em N ≥ 1.000 *patches*, descartadas 50 execuções de aquecimento. Do envio ao resultado na tela: p95 < 1,5 s com 1 usuário. Imagem já analisada (cache): p95 < 150 ms. *Limiares definidos pelo autor como decisão de projeto, para manter a interação fluida em aula.* | Tempos registrados em cada análise; teste de carga (k6) |
| RNF02 | **Usabilidade** | A interface deve ser utilizável por pessoas sem conhecimento técnico em IA. | SUS médio ≥ 85 (meta do autor), mínimo aceitável 68, interpretado pela escala adjetiva de Bangor, Kortum e Miller (2009); ≥ 90% dos participantes concluem a tarefa principal sem ajuda (medido apenas em avaliação moderada) | Questionário SUS (BROOKE, 1996) e teste de tarefas |
| RNF03 | Portabilidade | O sistema deve executar em ambiente containerizado. | Todo o ambiente sobe com um único comando (`docker compose up`) em menos de 10 min numa máquina limpa, com ou sem GPU | Checklist em máquina limpa |
| RNF04 | **Segurança — privacidade** | Os dados de participantes devem ser tratados conforme a LGPD. | Nenhum dado de paciente; participantes pseudonimizados; aceite do TCLE registrado; logs sem e-mail nem imagem | Revisão do banco de dados; teste automatizado dos logs |
| RNF05 | **Disponibilidade** | O sistema deve permanecer estável durante aulas e demonstrações. | ≥ 99% de requisições bem-sucedidas em sessão de 60 min; reinício automático de serviços; nenhum pedido de análise perdido em falha | Teste de longa duração (k6); verificação de saúde dos serviços |
| RNF06 | Manutenibilidade | O serviço de IA deve ser separado do backend, com versionamento independente do modelo. | O serviço de IA não tem acesso ao banco de dados; comunica-se apenas por fila de mensagens; troca de modelo sem recompilar o backend; cobertura de testes ≥ 70% | Teste de arquitetura; integração contínua |
| RNF07 *(proposto)* | **Segurança** | O sistema deve proteger contas, sessões e entradas. | Senhas com hash Argon2 ou bcrypt; sessão em cookie `httpOnly`/`Secure`; HTTPS fora do ambiente local; validação do tipo real do arquivo; limite de requisições por usuário; nenhum segredo no código | Testes de integração; checklist OWASP Top 10 |
| RNF08 *(proposto)* | **Compatibilidade** | A interface deve funcionar nos navegadores e equipamentos dos laboratórios de informática. | Versões recentes de Chrome, Edge e Firefox; resolução mínima 1366 × 768; tema claro legível em projetor de sala de aula; serviço de IA funcional apenas com CPU, sem GPU | Testes automatizados de interface em vários navegadores; teste em máquina do laboratório |
| RNF09 *(proposto)* | **Escalabilidade** (capacidade) | O sistema deve absorver picos de uso simultâneo em aula sem esgotar a memória. | 30 usuários virtuais por 10 min, cada um enviando 1 *patch* a cada 20 s, com taxa de erro < 1% e p95 do envio ao resultado < 3 s; o número de serviços de IA pode ser aumentado sem mudar o código; a fila controla a carga sobre cada serviço de IA | Teste de carga com 1 e com 2 serviços de IA (k6) |
| RNF10 *(proposto)* | **Adequação funcional** (qualidade do modelo) | O modelo ativo deve atingir o desempenho mínimo no conjunto de teste independente. | No CRC-VAL-HE-7K: acurácia balanceada ≥ `[[meta a definir com o orientador]]` e sensibilidade da classe TUM ≥ `[[meta]]`, com IC 95% por *bootstrap*; proporção de NORM classificada como TUM ≤ `[[meta]]`. Calibração reportada pelo ECE, antes e depois de *temperature scaling* | Relatório de avaliação (`ml/reports`) e *model card* |
| RNF11 *(proposto)* | **Usabilidade** (acessibilidade) | A interface deve atender às WCAG 2.2, nível AA (WORLD WIDE WEB CONSORTIUM, 2023), nas telas autenticadas. | Zero violações graves no axe-core em todas as rotas; verificação manual dos critérios 2.1.1, 2.1.4, 2.5.7 e 1.4.13 | Testes automatizados (Playwright + axe) e checklist manual |

**Regras de negócio** (referenciadas nos casos de uso):

| ID | Regra |
|---|---|
| RN01 | Formatos aceitos: PNG e JPEG, até 5 MB. Imagens maiores que 224 × 224 px **não são reduzidas** (isso alteraria o tamanho dos núcleos, que é informação diagnóstica): o sistema analisa um recorte central de 224 × 224 px na escala original e avisa o usuário. Imagens menores são recusadas com mensagem. |
| RN02 | Um lote tem no máximo 50 imagens. |
| RN03 | Um resultado é de **baixa confiança** quando a probabilidade da classe principal, **depois de calibrada** por *temperature scaling* na validação, é menor que 60% (limiar provisório, fixado e registrado em *commit* datado antes da primeira execução sobre o conjunto de teste). Nesses casos a interface exibe alerta. A utilidade do limiar é reportada no teste: acurácia dos resultados com e sem alerta. |
| RN04 | A interface nunca usa "diagnóstico", "laudo", "confirmado", "detecta câncer", "maligno", "benigno", "positivo", "negativo" ou "tumor encontrado" para descrever a saída do sistema. Menções em frases de negação no aviso ético (ex.: "não substitui laudo") são permitidas e listadas no teste. |
| RN05 | Uma imagem idêntica, analisada pela mesma versão do modelo, reaproveita o resultado anterior (cache por hash SHA-256 da imagem mais a versão do modelo). |
| RN06 | O Estudante acessa apenas o próprio histórico. |
| RN07 | No modo quiz, o rótulo de referência (do *dataset*) só aparece depois da resposta do estudante. |
| RN08 | A área de envio orienta a enviar apenas o recorte de tecido e proíbe imagens com etiqueta da lâmina, número de exame, nome ou qualquer dado de paciente; os metadados EXIF são removidos antes do armazenamento. |
| RN09 | As amostras da galeria e do quiz vêm de imagens **não usadas no treino** (CRC-VAL-HE-7K), sorteadas sem condicionar ao acerto do modelo. |

---

## 4. Histórias de usuário e Product Backlog

### 4.1 Épicos
| Épico | Descrição |
|---|---|
| E1 | Análise de imagens (envio, classificação, confiança) |
| E2 | Explicabilidade visual (Grad-CAM) |
| E3 | Apoio pedagógico (galeria, *tooltips*, quiz) |
| E4 | Histórico e rastreabilidade |
| E5 | Acesso, ética e conformidade |
| E6 | Administração do modelo |

### 4.2 Histórias de usuário

As histórias seguem o formato "Como [papel], quero [funcionalidade], para [benefício]" (COHN, 2004), com critérios de aceitação em cenários Gherkin nas histórias principais.

**HU01 — Enviar patch** *(E1 · RF01 · M)*
Como **estudante de Medicina**, quero **arrastar um patch PNG ou JPEG para a tela**, para **obter a classificação sem precisar configurar nada**.

```gherkin
# language: pt
Funcionalidade: Envio de patch para análise
  Cenário: Envio de imagem válida
    Dado que estou autenticado na workstation
    Quando arrasto um arquivo PNG de 224x224 px e 150 KB para a área de envio
    Então vejo a análise em andamento imediatamente
    E recebo a classe sugerida e o mapa Grad-CAM em até 1,5 segundo

  Cenário: Envio de formato não suportado
    Dado que estou autenticado na workstation
    Quando arrasto um arquivo GIF para a área de envio
    Então vejo a mensagem "Formato não suportado. Envie PNG ou JPEG."
    E nenhuma análise é criada

  Cenário: Imagem maior que 224x224
    Quando envio um PNG de 512x512 px
    Então vejo o aviso de que foi analisado um recorte central de 224x224 px, sem redução de escala
    E a análise é processada normalmente
```

**HU02 — Analisar amostra da galeria** *(E3 · RF01, RF02 · M)*
Como **estudante**, quero **analisar com um clique uma amostra de cada uma das 9 classes**, para **conhecer a ferramenta e os padrões teciduais mesmo sem ter imagens próprias**.
*Critérios:* a galeria mostra 9 miniaturas identificadas e uma opção "aleatória"; um clique dispara a análise; o rótulo de referência do *dataset* aparece junto ao resultado.

**HU03 — Enviar lote para aula** *(E1 · RF01 · S)*
Como **professor de Patologia**, quero **enviar até 50 patches de uma vez**, para **preparar o material de uma aula prática**.
*Critérios:* lista com o andamento de cada imagem; o lote fica salvo com um nome; um lote com 51 imagens é recusado com mensagem (RN02).

**HU04 — Ver resultado e confiança** *(E1 · RF02, RF03 · M)*
Como **estudante**, quero **ver a classe sugerida e a confiança das 9 classes**, para **entender quão segura é a sugestão do modelo**.

```gherkin
  Cenário: Exibição das confianças
    Dado que uma análise foi concluída
    Então vejo 9 barras ordenadas da maior para a menor confiança
    E a soma dos percentuais é 100%
    E a classe sugerida aparece destacada
```

**HU05 — Consultar morfologia das classes** *(E3 · RF03 · M)*
Como **estudante**, quero **ler os critérios morfológicos de cada classe ao passar o cursor sobre ela**, para **relacionar a sugestão do modelo aos achados histológicos**.
*Critérios:* cada uma das 9 classes tem descrição revisada por um docente de Patologia; o texto é acessível também por teclado.

**HU06 — Alerta de baixa confiança** *(E3 · RF03 · S)*
Como **professor**, quero **que resultados de baixa confiança sejam destacados**, para **discutir casos ambíguos com a turma e evitar confiança cega no modelo**.

```gherkin
  Cenário: Resultado ambíguo
    Dado que a classe principal tem 52% de confiança
    Então vejo um alerta âmbar "Baixa confiança — interprete com cautela"
```

**HU07 — Sobrepor Grad-CAM com opacidade ajustável** *(E2 · RF04 · M)*
Como **estudante**, quero **sobrepor o mapa Grad-CAM ao patch e ajustar a opacidade**, para **ver quais regiões influenciaram a decisão sem esconder a morfologia**.

```gherkin
  Cenário: Ajuste de opacidade
    Dado que vejo o resultado de uma análise
    Quando movo o controle de opacidade de 40% para 0%
    Então vejo apenas o patch original
    Quando movo o controle para 100%
    Então vejo o mapa de calor totalmente opaco sobre o patch
```

**HU08 — Comparar lado a lado com zoom sincronizado** *(E2 · RF04 · S)*
Como **estudante**, quero **ver o patch e o mapa lado a lado com zoom e deslocamento sincronizados**, para **comparar a mesma região nos dois painéis**.
*Critérios:* zoom de 1× a 8×; o zoom ou deslocamento em um painel se repete no outro; atalho de teclado para alternar os modos.

**HU09 — Grad-CAM para outra classe** *(E2 · RF04 · C, a validar)*
Como **professor**, quero **gerar o mapa para uma classe diferente da sugerida**, para **mostrar à turma onde o modelo "veria" outro tecido**.

**HU10 — Consultar histórico** *(E4 · RF05, RF06 · M)*
Como **estudante**, quero **consultar e reabrir minhas análises anteriores**, para **revisar o conteúdo estudado**.
*Critérios:* lista paginada com filtros por classe, data e lote; reabrir uma análise mostra o mesmo resultado e a mesma versão do modelo; o estudante não vê análises de outros usuários (RN06).

**HU11 — Exportar histórico** *(E4 · RF10 · C, a validar)*
Como **professor**, quero **exportar o histórico em CSV**, para **organizar o material da disciplina**.

**HU12 — Aviso ético permanente** *(E5 · RF07 · M)*
Como **professor**, quero **que todas as telas exibam o aviso de que a ferramenta não substitui laudo**, para **evitar que alunos a usem como diagnóstico**.

```gherkin
  Cenário: Aviso em todas as telas
    Dado que estou autenticado
    Quando navego para qualquer tela do sistema
    Então vejo o aviso "Ferramenta educacional para estudo de padrões histológicos. Não substitui o exame anatomopatológico nem o laudo. A decisão clínica é sempre do médico."
    E o aviso pode ser minimizado, mas não removido
```

**HU13 — Praticar em modo quiz** *(E3 · RF09 · S)*
Como **estudante**, quero **escolher a classe de uma amostra antes de ver a resposta e entender meu erro quando errar**, para **treinar meu reconhecimento histológico com retorno imediato**.

```gherkin
  Cenário: Resposta no quiz
    Dado que iniciei o modo quiz com uma amostra da galeria
    Quando seleciono a classe "STR"
    Então vejo se acertei, o rótulo de referência e a sugestão do modelo
    E antes da minha resposta nenhuma dessas informações estava visível

  Cenário: Erro explicado
    Dado que a amostra é "MUS" e eu respondi "STR"
    Então vejo os critérios morfológicos que diferenciam músculo liso de estroma
```

**HU14 — Autenticar-se** *(E5 · RF08 · M)*
Como **usuário**, quero **entrar com e-mail e senha**, para **acessar meu histórico com segurança**.

**HU15 — Conhecer o modelo e suas limitações** *(E5 · RF11 · S)*
Como **professor**, quero **ver a versão do modelo, suas métricas e limitações**, para **explicar aos alunos até onde a ferramenta é confiável**.

**HU16 — Trocar versão do modelo** *(E6 · RF12 · C, a validar)*
Como **administrador**, quero **definir a versão ativa do modelo**, para **atualizar o classificador sem interromper o sistema**.

**HU17 — Aceitar termo de uso** *(E5 · RF13 · M)*
Como **participante da pesquisa**, quero **ler e aceitar o termo antes de usar a ferramenta**, para **saber como meus dados serão tratados**.

**HU18 — Reenviar análise com falha** *(E1 · RF14 · S)*
Como **estudante**, quero **ser avisado quando uma análise falhar e poder reenviá-la**, para **não perder a imagem nem o tempo da aula**.

**HU19 — Acompanhar a análise em tempo real** *(E1 · RNF01 · M)*
Como **estudante**, quero **ver o andamento da análise em tempo real**, para **saber que o sistema está processando minha imagem**.

**HU20 — Comparar classes confundíveis** *(E3 · RF15 · C, a validar)*
Como **estudante**, quero **ver lado a lado amostras de dois tecidos que costumo confundir**, para **aprender o que diferencia um do outro**.
*Critérios:* pares pré-definidos (STR × MUS, NORM × TUM, DEB × LYM, MUC × BACK) e a opção de escolher qualquer par; os critérios diferenciais aparecem abaixo das imagens.

**HU21 — Acompanhar meu progresso** *(E3 · RF16 · C)*
Como **estudante**, quero **ver meu percentual de acertos no quiz por tipo de tecido**, para **saber se estou progredindo ou só memorizando as mesmas imagens**.

**HU22 — Ser avisado sobre imagem fora do padrão** *(E1 · RF17 · M)*
Como **estudante**, quero **ser avisado quando minha imagem for diferente das usadas no treino do modelo**, por exemplo uma foto de celular, para **não confiar em um resultado provavelmente errado**.

```gherkin
  Cenário: Foto de celular
    Quando envio uma foto do microscópio tirada com o celular
    Então vejo o aviso "Esta imagem difere do padrão usado no treino do modelo; o resultado pode não ser confiável"
    E a classificação é exibida somente após o aviso
```

**HU23 — Encontre o intruso** *(E3 · RF18 · C, a validar)*
Como **estudante**, quero **receber um conjunto de amostras e apontar qual delas é de outro tecido**, para **treinar a diferenciação entre tecidos**.
*Critérios:* grade com 4 a 6 amostras da galeria, sendo uma de classe diferente; a resposta só aparece depois da escolha; em caso de erro, mostra os critérios que diferenciam as classes. A versão por região dentro de uma mesma imagem, sugerida por E02, exigiria anotações que o *dataset* não tem e fica como trabalho futuro.

### 4.3 Product Backlog inicial

Estimativas em *story points* (sequência de Fibonacci), com sprints de duas semanas. Os itens EN são **habilitadores técnicos**: não têm valor direto para o usuário, mas sustentam as histórias. Situação em 18/11/2026: EN03 concluído; EN01 e EN02 em andamento (ver coluna Status).

| Ordem | ID | Item | Épico | MoSCoW | Pontos | Sprint planejada | Status |
|---|---|---|---|---|---|---|---|
| 1 | EN01 | Pipeline de treino e avaliação do modelo (separação treino/validação, teste no CRC-VAL-HE-7K, métricas scikit-learn) | — | M | 13 | S1 | Em andamento: código e testes prontos (PR #42); falta o treino real |
| 2 | EN02 | Ambiente Docker Compose (Postgres, Redis, RabbitMQ, web, serviço de IA) | — | M | 5 | S1 | Em andamento: infraestrutura pronta (PR #41); web e serviço de IA entram com HU01 e EN04 |
| 3 | EN03 | Contrato JSON das mensagens entre backend e serviço de IA (versão 1) | — | M | 3 | S1 | Concluído (PR #40) |
| 4 | EN04 | Serviço de IA: consumir a fila, classificar, gerar Grad-CAM e publicar o resultado | — | M | 8 | S2 | A fazer |
| 5 | HU14 | Autenticar-se | E5 | M | 5 | S2 | A fazer |
| 6 | HU17 | Aceitar termo de uso (pré-condição do envio) | E5 | M | 3 | S2 | A fazer |
| 7 | HU01 | Enviar patch | E1 | M | 5 | S2 | A fazer |
| 8 | HU19 | Acompanhar a análise em tempo real (SSE) | E1 | M | 5 | S2 | A fazer |
| 9 | HU04 | Ver resultado e confiança | E1 | M | 5 | S2 | A fazer |
| 10 | HU12 | Aviso ético permanente | E5 | M | 1 | S2 | A fazer |
| 11 | HU07 | Sobrepor Grad-CAM com opacidade ajustável | E2 | M | 8 | S3 | A fazer |
| 12 | HU02 | Analisar amostra da galeria | E3 | M | 3 | S3 | A fazer |
| 13 | HU05 | Consultar morfologia das classes | E3 | M | 3 | S3 | A fazer |
| 14 | HU22 | Ser avisado sobre imagem fora do padrão | E1 | M | 5 | S3 | A fazer |
| 15 | HU10 | Consultar histórico | E4 | M | 5 | S3 | A fazer |
| 16 | HU08 | Comparar lado a lado com zoom sincronizado | E2 | S | 8 | S4 | A fazer |
| 17 | HU06 | Alerta de baixa confiança | E3 | S | 2 | S4 | A fazer |
| 18 | HU18 | Reenviar análise com falha | E1 | S | 3 | S4 | A fazer |
| 19 | HU15 | Conhecer o modelo e suas limitações | E5 | S | 2 | S4 | A fazer |
| 20 | HU13 | Praticar em modo quiz (com erro explicado) | E3 | S | 5 | S5 | A fazer |
| 21 | HU03 | Enviar lote para aula | E1 | S | 8 | S5 | A fazer |
| 22 | EN05 | Testes de carga e de longa duração (k6) | — | M | 5 | S5 | A fazer |
| 23 | EN06 | Aplicação do SUS e das entrevistas de avaliação | — | M | 5 | S6 | A fazer |
| 24 | HU20 | Comparar classes confundíveis | E3 | C | 5 | S6 | A fazer |
| 25 | HU21 | Acompanhar meu progresso | E3 | C | 3 | S6 | A fazer |
| 26 | HU23 | Encontre o intruso | E3 | C | 5 | S6 | A fazer |
| 27 | HU11 | Exportar histórico | E4 | C | 2 | S6 | A fazer |
| 28 | HU09 | Grad-CAM para outra classe | E2 | C | 3 | S6 | A fazer |
| 29 | HU16 | Trocar versão do modelo | E6 | C | 5 | S6 | A fazer |

**Total:** 138 pontos em 6 sprints (S1 = 21, S2 = 32, S3 = 24, S4 = 15, S5 = 18, S6 = 28). A S2 ficou acima da média porque o aceite do termo (HU17) é pré-condição do envio; se a velocidade real não comportar, a HU19 passa para a S3. Os itens *Could* da S6 são os primeiros a sair se faltar capacidade. **Revisões:** em 16/11, HU22 subiu para *Must* (S3) e entrou a HU23; em 18/11, HU17 subiu para *Must* (S2) e HU20 voltou a *Could* (S6).

**Definição de Pronto (DoD):** código revisado; testes automatizados do item passando; critérios de aceite verificados; aviso ético presente; documentação atualizada na seção correspondente da monografia.

---

## 5. Modelagem UML de requisitos

### 5.1 Diagrama de casos de uso

**Figura 1 — Diagrama de casos de uso da ferramenta HistoLente**

Código-fonte PlantUML: `docs/engenharia-requisitos/casos-de-uso.puml`

![Diagrama de casos de uso](casos-de-uso.svg){.paisagem}
Fonte: elaborado pelo autor (2026).

**Atores:**

| Ator | Tipo | Descrição |
|---|---|---|
| Estudante de Medicina | Primário | Usa a ferramenta para estudar padrões histológicos. |
| Professor de Patologia | Primário (especialização de Estudante) | Faz tudo o que o estudante faz e também prepara material em lote para as aulas. |
| Administrador | Primário | Gerencia usuários e a versão ativa do modelo. |
| Serviço de Inferência | Secundário (sistema) | Componente isolado que executa a CNN e o Grad-CAM; recebe e devolve trabalhos pela fila de mensagens. |

**Restrição transversal:** RF07, o aviso ético, aparece em todos os casos de uso que exibem telas.

### 5.2 Especificação dos casos de uso principais

#### UC02 — Enviar patch para análise
| Campo | Descrição |
|---|---|
| **Atores** | Estudante (primário); Serviço de Inferência (secundário) |
| **Requisitos** | RF01, RF02, RF03, RF04, RF05, RF07, RF14, RF17, RNF01 |
| **Pré-condições** | Usuário autenticado (UC01) e termo de uso aceito (RF13). |
| **Pós-condições** | Análise registrada no histórico com probabilidades, mapa Grad-CAM e versão do modelo. |
| **Gatilho** | O usuário solta um arquivo na área de envio, clica nela ou cola uma imagem (Ctrl+V). |

**Fluxo principal**
1. O ator seleciona ou arrasta um arquivo de imagem.
2. O sistema valida o formato e o tamanho (RN01) e exibe a análise como "em andamento".
3. O sistema calcula o hash da imagem e verifica se já existe resultado para ela com a versão ativa do modelo (RN05).
4. Não existe resultado: o sistema registra a análise e envia o trabalho para a fila de inferência.
5. O Serviço de Inferência executa **UC05 — Classificar patch**, que inclui **UC06 — Gerar mapa Grad-CAM**, e devolve o resultado pela fila.
6. O sistema grava o resultado no histórico (RF05) e notifica a tela em tempo real.
7. O sistema exibe o resultado (**UC07**): classe sugerida, confiança das 9 classes e mapa Grad-CAM.

**Fluxos alternativos**
- **A1 — Resultado já existente (passo 3):** o sistema reutiliza o resultado, registra a nova análise como "reaproveitada do cache" e segue para o passo 7.
- **A2 — Dimensão maior que 224 × 224 (passo 2):** o sistema analisa um recorte central de 224 × 224 px, sem reduzir a escala, avisa o usuário e continua (RN01). Imagens menores são recusadas (E1).
- **A3 — Baixa confiança (passo 7):** o sistema exibe o alerta da RN03.
- **A4 — Imagem fora do padrão (passo 7):** se a imagem parecer diferente do padrão do dataset (foto de celular, outra coloração, sem tecido), o sistema exibe o aviso do RF17 antes da classificação.

**Fluxos de exceção**
- **E1 — Formato ou tamanho inválido (passo 2):** o sistema exibe mensagem explicativa e encerra o caso de uso sem registrar análise.
- **E2 — Falha no processamento (passo 5):** depois de 3 tentativas automáticas, a análise é marcada como falha. O sistema informa o usuário e oferece o reenvio (RF14).
- **E3 — Conexão em tempo real interrompida (passo 6):** a tela reconecta e consulta o estado atual da análise, sem perder o resultado.

**Regras de negócio:** RN01, RN03, RN04, RN05.

#### UC03 — Analisar amostra da galeria (extensão: UC09 — Praticar em modo quiz)
| Campo | Descrição |
|---|---|
| **Atores** | Estudante |
| **Requisitos** | RF01, RF02, RF09 |
| **Pré-condições** | Usuário autenticado. |
| **Pós-condições** | Análise registrada no histórico com o rótulo de referência da amostra. |

**Fluxo principal**
1. O ator abre a galeria, que mostra 9 miniaturas (uma por classe) e a opção "aleatória".
2. O ator seleciona uma amostra.
3. O sistema executa os passos 3 a 6 do UC02 (inclui UC05).
4. O sistema exibe o resultado (UC07) junto com o rótulo de referência da amostra.

**Ponto de extensão — Modo quiz (UC09):**
- No passo 2, se o ator ativou o modo quiz, o sistema oculta o rótulo de referência da amostra.
- Antes do passo 4, o sistema pede que o ator escolha uma classe entre as 9.
- Após a resposta, o sistema exibe acerto ou erro, o rótulo de referência e a sugestão do modelo (RN07).

**Fluxo de exceção:** E1 — falha no processamento, tratada como em UC02-E2.

#### UC08 — Explorar mapa Grad-CAM
| Campo | Descrição |
|---|---|
| **Atores** | Estudante |
| **Requisitos** | RF04, RNF02, RNF08 |
| **Pré-condições** | Existe uma análise concluída em exibição (UC07). |
| **Pós-condições** | Nenhuma alteração de dados: o caso de uso apenas muda a visualização. |

**Fluxo principal**
1. O sistema exibe o mapa Grad-CAM sobre o *patch*, com opacidade inicial de 40%.
2. O ator ajusta a opacidade entre 0% e 100%, com o mouse ou com as setas do teclado; a imagem se atualiza imediatamente.
3. O ator aplica zoom (de 1× a 8×) e desloca a imagem.
4. O ator alterna para o modo lado a lado.
5. O sistema exibe o *patch* e o mapa em dois painéis; zoom e deslocamento feitos em um painel se repetem no outro.

**Fluxos alternativos**
- **A1 — Trocar paleta de cores:** o ator escolhe outra paleta acessível (turbo ou viridis).
- **A2 — Modo contorno:** o sistema mostra apenas as linhas de contorno das regiões mais relevantes, para não encobrir os núcleos.
- **A3 — Mapa para outra classe (RF04, HU09):** o ator escolhe outra classe; o sistema solicita um novo mapa ao Serviço de Inferência (UC06).
- **A4 — Restaurar visualização:** a tecla "0" volta ao zoom de 100% e à posição inicial.

#### UC10 — Consultar histórico de análises (extensão: UC11 — Exportar CSV)
| Campo | Descrição |
|---|---|
| **Atores** | Estudante (e Professor, por herança) |
| **Requisitos** | RF05, RF06, RF10 |
| **Pré-condições** | Usuário autenticado. |
| **Pós-condições** | Nenhuma alteração de dados. |

**Fluxo principal**
1. O ator abre o histórico.
2. O sistema lista as análises do próprio ator (RN06), da mais recente para a mais antiga, 20 por página.
3. O ator aplica filtros por classe, período ou lote.
4. O ator seleciona uma análise.
5. O sistema reabre a análise com o mesmo resultado, o mesmo mapa e a mesma versão do modelo (UC07).

**Ponto de extensão — Exportar (UC11):** no passo 3, o ator solicita a exportação, e o sistema gera um CSV com as análises filtradas.

**Fluxos de exceção**
- **E1 — Histórico vazio:** o sistema sugere a galeria de amostras.
- **E2 — Acesso a análise de outro usuário pela URL:** o sistema responde "não encontrado" (RN06).

---

## 6. Matriz de rastreabilidade

### 6.1 Casos de teste planejados

Os casos de teste abaixo estão **especificados**; a execução é registrada em cada sprint. Até 18/11/2026 existem testes automatizados para os contratos de mensagem, o *schema* do banco, o ambiente Docker e o pipeline de treino (EN01–EN03), executados na integração contínua.

| CT | Descrição | Tipo | Ferramenta |
|---|---|---|---|
| CT01 | Envio de PNG válido cria a análise e devolve o resultado | E2E | Playwright |
| CT02 | GIF e arquivo maior que 5 MB são rejeitados com mensagem | Integração + componente | Vitest / API |
| CT03 | Imagem maior que 224 × 224 é analisada por recorte central, sem redução de escala, com aviso; imagem menor é recusada | Integração | pytest |
| CT04 | Amostra da galeria é analisada com um clique | E2E | Playwright |
| CT05 | Lote com 50 imagens é aceito; com 51, recusado | Integração | API |
| CT06 | Saída sempre entre as 9 classes e probabilidades somando 1 | Unidade | pytest |
| CT07 | Conjunto-ouro produz as mesmas probabilidades no serviço de inferência e no pipeline de treino (± 0,001) | Integração | pytest |
| CT08 | Barras ordenadas, somando 100% e com a classe sugerida destacada | Componente | Vitest |
| CT09 | *Tooltip* mostra os critérios morfológicos, inclusive via teclado | Componente | Vitest |
| CT10 | Alerta de baixa confiança conforme RN03 (inclui casos 0,59 e 0,61) | Componente | Vitest |
| CT11 | Mapa Grad-CAM tem 224 × 224 px e valores entre 0 e 1 | Unidade | pytest |
| CT12 | Controle de opacidade altera a sobreposição de 0% a 100% | E2E | Playwright |
| CT13 | Zoom e deslocamento sincronizados no modo lado a lado | E2E | Playwright |
| CT14 | Análise gravada com probabilidades, mapa e versão do modelo | Integração | API + Postgres |
| CT15 | Histórico paginado, filtrado e reaberto corretamente | E2E | Playwright |
| CT16 | Usuário não acessa análise de outro usuário | Integração | API |
| CT17 | Aviso ético presente em todas as telas | E2E | Playwright |
| CT18 | Termos proibidos (RN04) ausentes nos textos de resultado, exceto as negações listadas do aviso ético | Unidade | Vitest |
| CT19 | Login e permissões por perfil | Integração | API |
| CT20 | Quiz oculta o rótulo de referência até a resposta e explica o erro | Componente | Vitest |
| CT21 | Exportação CSV com as colunas corretas | Integração | API |
| CT22 | Tela "Sobre o modelo" exibe versão e limitações | E2E | Playwright |
| CT23 | Trocar a versão ativa do modelo invalida o cache | Integração | API + Redis |
| CT24 | Aceite do termo é registrado e bloqueia o uso enquanto pendente | Integração | API |
| CT25 | Falha no processamento gera aviso e permite reenvio | Integração | API + RabbitMQ |
| CT26 | Serviço de inferência com p95 < 500 ms | Desempenho | pytest-benchmark |
| CT27 | Do envio ao resultado com p95 < 1,5 s; 30 usuários simultâneos | Carga | k6 |
| CT28 | Resultado em cache com p95 < 150 ms | Carga | k6 |
| CT29 | SUS médio ≥ 85 e conclusão de tarefas ≥ 90% | Usabilidade | Questionário SUS |
| CT30 | Ambiente sobe com `docker compose up` em máquina limpa | Manual | Checklist |
| CT31 | Logs sem e-mail ou imagem; senhas armazenadas com hash | Integração | pytest / API |
| CT32 | 60 minutos de uso com ≥ 99% de sucesso | Longa duração | k6 |
| CT33 | Serviço de IA sem acesso ao banco de dados | Arquitetura | pytest + análise do Compose |
| CT34 | Interface funcional em Chromium, Firefox e WebKit a 1366 × 768 | E2E | Playwright |
| CT35 | Vazão aumenta ao passar de 1 para 2 serviços de IA | Carga | k6 |
| CT36 | Revisão do checklist OWASP Top 10 | Segurança | Checklist |
| CT37 | Comparação de par de classes exibe amostras e critérios diferenciais | E2E | Playwright |
| CT38 | Painel de progresso calcula acertos por classe e só mostra os dados do próprio estudante | Integração | API |
| CT39 | Fotos de celular e imagens sem tecido ou com outra coloração geram o aviso de imagem fora do padrão | Integração | pytest + conjunto de imagens fora do padrão |
| CT40 | Desafio mostra uma amostra de classe diferente entre as demais e só revela a resposta após a escolha | Componente | Vitest |
| CT41 | Métricas do modelo no CRC-VAL-HE-7K atingem as metas do RNF10, com IC 95% | Avaliação do modelo | pytest + relatório |
| CT42 | Zero violações graves de acessibilidade (axe-core) em todas as rotas | E2E | Playwright + axe |
| CT43 | Área de envio exibe a orientação da RN08 e imagens armazenadas não têm EXIF | Integração | API |

### 6.2 Matriz Requisito × História × Caso de uso × Teste

| Requisito | Origem (técnica / lacuna do Pré-TCC) | Histórias | Casos de uso | Casos de teste | Etapa de validação (Pré-TCC 2.4) |
|---|---|---|---|---|---|
| RF01 | T2, T4 / Lacuna 1 | HU01, HU02, HU03 | UC02, UC03, UC04 | CT01–CT05 | Funcional |
| RF02 | T1, T2 / Lacuna 1 | HU02, HU04 | UC03, UC05 | CT06, CT07, CT41 | Funcional + Desempenho do modelo |
| RF03 | T2, T4 / Lacuna 2 | HU04, HU05, HU06 | UC05, UC07 | CT08, CT09, CT10 | Funcional + Estudo de caso |
| RF04 | T1 / Lacuna 3 | HU07, HU08, HU09 | UC06, UC08 | CT11, CT12, CT13 | Funcional + Estudo de caso |
| RF05 | T1 | HU10 | UC02, UC10 | CT14 | Funcional |
| RF06 | T1 | HU10 | UC10 | CT15, CT16 | Funcional |
| RF07 | T3 | HU12 | Todos com tela | CT17, CT18 | Funcional + Estudo de caso |
| RF08 | T3 | HU14 | UC01, UC13 | CT19 | Funcional |
| RF09 | T4, T5 / Lacuna 2 | HU13 | UC09 | CT20 | Estudo de caso + SUS |
| RF10 | T4 (a validar) | HU11 | UC11 | CT21 | Funcional |
| RF11 | T3, T4 / Lacuna 3 | HU15 | UC07 | CT22 | Estudo de caso |
| RF12 | T4 (a validar) | HU16 | UC12 | CT23 | Funcional |
| RF13 | T3 | HU17 | UC01 | CT24 | Funcional |
| RF14 | T4 | HU18 | UC02 | CT25 | Funcional |
| RF15 | T4, T5 (hipótese não refutada; *Could*) / Lacuna 2 | HU20 | UC14 | CT37 | Estudo de caso + SUS |
| RF16 | T4, T5 / Lacuna 2 | HU21 | UC15 | CT38 | Estudo de caso |
| RF17 | T1, T5 / Lacuna 1 | HU22 | UC02 | CT39 | Funcional + Desempenho do modelo |
| RF18 | T5 (a validar) / Lacuna 2 | HU23 | UC09 | CT40 | Estudo de caso |
| RNF01 | T1 | HU19 | UC02, UC05, UC06 | CT26, CT27, CT28 | Desempenho |
| RNF02 | T1 / Lacunas 2 e 3 | Todas | UC02, UC03, UC08 | CT29 | Usabilidade (SUS) |
| RNF03 | T1 | EN02 | — | CT30 | Funcional |
| RNF04 | T3 | HU17 | UC01 | CT24, CT31 | Funcional |
| RNF05 | T1 | EN05 | UC02 | CT25, CT32 | Desempenho |
| RNF06 | T1 / Lacuna 1 | EN03, EN04 | UC05, UC12 | CT23, CT33 | Funcional (arquitetura) |
| RNF07 | T3 | HU14 | UC01 | CT16, CT19, CT31, CT36 | Funcional (segurança) |
| RNF08 | T1 / Lacuna 1 (Zehra et al., 2023) | EN02 | UC08 | CT34 | Funcional |
| RNF09 | T4 / Lacuna 1 | EN05 | UC04, UC05 | CT27, CT35 | Desempenho |
| RNF10 | T1, T5 / Lacunas 1 e 3 | EN01 | UC05 | CT41 | Desempenho do modelo |
| RNF11 | T1 / Lacuna 3 | Todas com tela | Todos com tela | CT42 | Funcional + Usabilidade |

**Lacunas do Pré-TCC (Seção 1.8):**
1. Soluções de IA concentradas em contextos de alto orçamento.
2. Escassez de ferramentas de apoio pedagógico.
3. Explicabilidade acessível a não especialistas.

### 6.3 Verificação de cobertura
- Todos os 18 RF e os 11 RNF têm pelo menos uma história ou habilitador e pelo menos um caso de teste.
- Todos os RF têm caso de uso associado. RNF03 é atendido pela infraestrutura e não tem caso de uso de usuário.
- Todos os 15 casos de uso têm pelo menos um requisito de origem.
- As três lacunas do Pré-TCC têm requisitos associados.
- **Pendências:**
  - Executar T7 (observação) e T8 (prototipação com usuários).
  - Validar com professores os requisitos ainda marcados como "a validar" (RF10, RF12, RF18 e HU09), já que nenhum professor respondeu à T5.

---

## Histórico de revisões

| Versão | Data | Alterações |
|---|---|---|
| 1.0 | 10/11/2026 | Primeira versão: técnicas, RF, RNF, histórias, UML e rastreabilidade |
| 1.1 | 16/11/2026 | Consolidação da T5 (4 respostas); RF17 → *Must*, RF15 → *Should*, novo RF18; backlog reordenado |
| 1.3 | 18/11/2026 | Segunda revisão interna: situação ética da T5 declarada, critério (iii) de priorização, RF15 volta a *Could*, HU17 → *Must* (S2), UC02-A2 alinhado à RN01, banner e "rótulo de referência" alinhados ao protótipo, relação com o DSR |
| 1.2 | 18/11/2026 | Correções da revisão interna: vieses e limitações da T5, regra de priorização, RF17 especificado, RN01 sem redução de escala, RN03 calibrada, RN08 e RN09, RNF10 (qualidade do modelo) e RNF11 (acessibilidade), status do backlog e referências |

## Referências

BANGOR, Aaron; KORTUM, Philip; MILLER, James. Determining what individual SUS scores mean: adding an adjective rating scale. **Journal of Usability Studies**, v. 4, n. 3, p. 114-123, maio 2009.

BRASIL. **Lei nº 13.709, de 14 de agosto de 2018**. Lei Geral de Proteção de Dados Pessoais (LGPD). Brasília, DF: Presidência da República, 2018. Disponível em: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm.

BRAUN, Virginia; CLARKE, Victoria. Using thematic analysis in psychology. **Qualitative Research in Psychology**, v. 3, n. 2, p. 77-101, 2006. Disponível em: https://doi.org/10.1191/1478088706qp063oa.

BROOKE, John. SUS: a quick and dirty usability scale. In: JORDAN, Patrick W. et al. (ed.). **Usability evaluation in industry**. London: Taylor & Francis, 1996. p. 189-194.

COHN, Mike. **User stories applied**: for agile software development. Boston: Addison-Wesley, 2004.

CONSELHO FEDERAL DE MEDICINA (CFM). **Resolução CFM nº 2.454, de 27 de fevereiro de 2026**. Dispõe sobre o uso da inteligência artificial na medicina. Brasília, DF: CFM, 2026. Disponível em: https://sistemas.cfm.org.br/normas/arquivos/resolucoes/BR/2026/2454_2026.pdf.

INTERNATIONAL ORGANIZATION FOR STANDARDIZATION. **ISO/IEC 25010**: systems and software engineering — systems and software quality requirements and evaluation (SQuaRE) — system and software quality models. Geneva: ISO, 2011.

KATHER, Jakob Nikolas et al. **100,000 histological images of human colorectal cancer and healthy tissue**. Zenodo, 2018. Conjunto de dados. Disponível em: https://doi.org/10.5281/zenodo.1214456.

LITJENS, Geert et al. A survey on deep learning in medical image analysis. **Medical Image Analysis**, v. 42, p. 60-88, dez. 2017. Disponível em: https://doi.org/10.1016/j.media.2017.07.005. Acesso em: 16 set. 2026.

NIAZI, Muhammad Khalid Khan; PARWANI, Anil V.; GURCAN, Metin N. Digital pathology and artificial intelligence. **The Lancet Oncology**, v. 20, n. 5, p. e253-e261, maio 2019. Disponível em: https://doi.org/10.1016/S1470-2045(19)30154-8. Acesso em: 16 set. 2026.

PEFFERS, Ken et al. A design science research methodology for information systems research. **Journal of Management Information Systems**, v. 24, n. 3, p. 45-77, 2007. Disponível em: https://doi.org/10.2753/MIS0742-1222240302.

PRESSMAN, Roger S.; MAXIM, Bruce R. **Engenharia de software**: uma abordagem profissional. 8. ed. Porto Alegre: AMGH, 2016.

SELVARAJU, Ramprasaath R. et al. Grad-CAM: visual explanations from deep networks via gradient-based localization. In: IEEE INTERNATIONAL CONFERENCE ON COMPUTER VISION, 2017, Veneza. **Proceedings** [...]. Veneza: IEEE, 2017. p. 618-626. Disponível em: https://doi.org/10.1109/ICCV.2017.74. Acesso em: 16 set. 2026.

SOCIEDADE BRASILEIRA DE PATOLOGIA (SBP). **Demografia Médica 2025**: pesquisa aponta déficit alarmante de médicos patologistas no Brasil. São Paulo: SBP, 26 maio 2025. Disponível em: https://www.sbp.org.br/demografia-medica-2025-pesquisa-aponta-deficit-alarmante-de-medicos-patologistas-no-brasil/. Acesso em: 16 set. 2026.

SOMMERVILLE, Ian. **Engenharia de software**. 10. ed. São Paulo: Pearson Education do Brasil, 2019.

WORLD WIDE WEB CONSORTIUM (W3C). **Web Content Accessibility Guidelines (WCAG) 2.2**. W3C Recommendation, 5 out. 2023. Disponível em: https://www.w3.org/TR/WCAG22/.

ZEHRA, Talat et al. A suggested way forward for adoption of AI-enabled digital pathology in low resource organizations in the developing world. **Diagnostic Pathology**, v. 18, n. 68, p. 1-10, jun. 2023. Disponível em: https://doi.org/10.1186/s13000-023-01352-6. Acesso em: 16 set. 2026.
