# Roteiro de Entrevista Escrita (Remota) — Elicitação de Requisitos

**Pesquisa:** Reconhecimento Automatizado de Padrões Histológicos em Câncer Colorretal com IA: uma ferramenta de apoio à Patologia Digital
**Pesquisador:** Paulo Victor Silva Gonçalves — Engenharia de Software, UVS Maricá
**Formato:** escrito e remoto, sem gravação, aplicado via Google Forms. O formulário completo (TCLE, aceite, perfis e perguntas) é criado automaticamente por um script do Google Apps Script mantido pelo autor (fora do repositório).
**Tempo de resposta:** cerca de 10 minutos · **7 perguntas abertas + 1 quadro de funcionalidades**

**Perfis de participante:**
- **E** = estudante de Medicina
- **P** = professor de Patologia
- **L** = profissional de laboratório (patologista, técnico, biomédico, residente)

> **Nota metodológica:** sem entrevistador conduzindo em tempo real, a técnica fica entre a entrevista e o questionário aberto. No documento de requisitos, registre-a como *"entrevista estruturada escrita, aplicada remotamente"*. Se as respostas vierem por mensagem, você pode fazer **até 2 perguntas de aprofundamento** por participante. Registre essas perguntas também.

---

## Seção 1 — Apresentação e consentimento
*(texto de abertura do formulário ou da mensagem)*

> Olá! Sou Paulo Victor, aluno de Engenharia de Software da Universidade de Vassouras (Maricá). No meu TCC, estou desenvolvendo uma **ferramenta de estudo** que recebe uma imagem pequena de tecido do intestino grosso, corada em H&E, e sugere qual dos **9 tipos de tecido** ela é: por exemplo tumor, mucosa normal, músculo, estroma, linfócitos, muco. Ela também mostra um **mapa de calor** das regiões que mais pesaram na sugestão. A ferramenta é **educacional e não faz diagnóstico**.
>
> A ferramenta ainda não existe. Suas respostas vão ajudar a definir o que ela deve ter. Leva cerca de 10 minutos. Não há resposta certa ou errada, você pode deixar perguntas em branco e pode desistir a qualquer momento. **Não escreva seu nome, nomes de pacientes ou de instituições nas respostas.**

**Consentimento** (obrigatório antes das perguntas):
- [ ] Li o Termo de Consentimento Livre e Esclarecido (link: `[[LINK DO TCLE]]`) e concordo em participar.

*No Google Forms, configure: se a resposta for "não concordo", o formulário vai direto para o envio, sem mostrar as perguntas.*

## Seção 2 — Perfil
**Você é:** ( ) Estudante de Medicina ( ) Professor(a) de Patologia ( ) Profissional de laboratório
- **Se estudante:** em que período está? Já cursou Patologia? ( ) Sim ( ) Cursando ( ) Ainda não
- **Se professor(a):** há quanto tempo leciona? Também trabalha com laudos? ( ) Sim ( ) Não
- **Se profissional de laboratório:** qual é sua função e há quanto tempo atua?

## Seção 3 — Perguntas abertas
**1. Qual é a sua maior dificuldade hoje para reconhecer tecidos e padrões histológicos?**
*Se possível, dê um exemplo. Profissionais de laboratório: a qualidade ou a coloração da lâmina costuma atrapalhar?*

**2. Quais tecidos ou padrões você acha mais fáceis de confundir entre si?**
*Exemplos: músculo × estroma, mucosa normal × tumor, necrose × linfócitos.*

**3. Como e quando você usaria uma ferramenta como essa?**
*Para estudar, em aula, em treinamento, na rotina…*

**4. Um mapa de calor sobre a imagem, mostrando as regiões que mais influenciaram a sugestão, ajudaria ou atrapalharia você? Por quê?**

**5. Que tipo de imagem você teria para enviar à ferramenta?**
( ) Lâmina digitalizada ( ) Foto do microscópio pelo celular ( ) Imagem de atlas ou de slide de aula ( ) Outro: ______
*Profissionais de laboratório: o laboratório tem scanner de lâminas ou câmera acoplada ao microscópio?*

**6. O que essa ferramenta NÃO pode errar, ou não pode fazer, para você confiar nela?**

## Seção 4 — Quadro de funcionalidades
**7. Classifique cada funcionalidade:** *Essencial · Útil · Dispensável*
*(No Google Forms, use uma "grade de múltipla escolha".)*

| # | Funcionalidade | Essencial | Útil | Dispensável |
|---|---|---|---|---|
| 1 | Percentual de confiança de cada um dos 9 tipos de tecido | ( ) | ( ) | ( ) |
| 2 | Mapa de calor com controle de transparência e comparação lado a lado | ( ) | ( ) | ( ) |
| 3 | Descrição dos critérios morfológicos e do que *não* confundir | ( ) | ( ) | ( ) |
| 4 | Galeria com vários exemplos de cada tecido | ( ) | ( ) | ( ) |
| 5 | Modo quiz: eu respondo primeiro, depois vejo a resposta com o erro explicado | ( ) | ( ) | ( ) |
| 6 | Histórico e acompanhamento do meu progresso | ( ) | ( ) | ( ) |

**8. Faltou alguma funcionalidade ou observação importante?** *(opcional)*

## Encerramento
> Obrigado pela participação! Se quiser testar um protótipo da ferramenta mais adiante, deixe um contato abaixo (opcional). Ele será guardado separadamente das suas respostas.

**Contato para teste do protótipo** *(opcional)*: ______
*No Google Forms, colete esse contato em um **formulário separado**, cujo link aparece na mensagem de confirmação. Assim as respostas continuam anônimas.*

---

## Cuidados com os dados (para o pesquisador)
- [ ] No Google Forms, deixe **desativada** a opção "Coletar endereços de e-mail" e a de limitar a 1 resposta, que exige login.
- [ ] Atribua um código a cada resposta na ordem de chegada (E01, P01, L01…).
- [ ] Respostas recebidas por mensagem: copie o texto para um documento com o código e **apague a conversa** depois de transcrever.
- [ ] Remova das respostas qualquer nome ou instituição citados por engano.
- [ ] Baixe a planilha de respostas para uma pasta protegida no seu computador. Confirme com o orientador se ela deve ser apagada do Drive.

## Ligação com os requisitos
| Pergunta | Requisitos |
|---|---|
| 1, 2 | RF03 (critérios morfológicos), RN03 (alerta de baixa confiança), galeria |
| 3 | Prioridades MoSCoW; RF01 (envio em lote, para professores) |
| 4, quadro item 2 | RF04 |
| 5 | RF01 e RNF08 (risco de imagens fora do padrão do dataset, como foto de celular) |
| 6 | RF07, RF11, RN04 |
| Quadro itens 1, 3 | RF03 |
| Quadro itens 4, 5 | RF01 (galeria), RF09 (quiz) |
| Quadro item 6 | RF06, RF10 |
| 8 | Novos requisitos |

**Consolidação:** conte as marcações Essencial, Útil e Dispensável de cada item do quadro. Se a maioria marcar Essencial, o item é *Must*; se a maioria marcar Dispensável, o item é *Won't*. Agrupe as respostas abertas por tema (dificuldades, confusões, uso, confiança) e registre os trechos mais representativos, sempre com o código e nunca com o nome.
