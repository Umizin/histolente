/**
 * Formulário de avaliação do protótipo do HistoLente (teste remoto não moderado).
 * TCLE + perfil + resultado de cada tarefa + tarefa de diferenciação + itens de compreensão + SUS (10 itens) + 2 perguntas abertas.
 * NÃO APLICAR antes do parecer escrito sobre a necessidade de registro no CEP.
 *
 * COMO USAR
 * 1. https://script.google.com → Novo projeto → cole este arquivo → preencha o CONFIG.
 * 2. Execute "criarFormularioAvaliacao" e autorize.
 * 3. Copie o link "para participantes" do Registro de execução e cole na constante
 *    FORMULARIO_AVALIACAO de prototipo/index.html.
 */

const CONFIG = {
  pesquisador: 'Paulo Victor Silva Gonçalves',
  contatoPesquisador: '[[E-MAIL OU TELEFONE DO PESQUISADOR]]',
  orientador: '[[NOME DO(A) ORIENTADOR(A)]]',
  cep: '[[CONTATO DO CEP — ou remover a frase se o CEP for dispensado]]',
  linkPrototipo: '[[LINK DO PROTÓTIPO COM ?teste]]',
  linkTclePdf: '[[LINK PARA O PDF DO TCLE]]',
  prazoGuarda: '[[PRAZO DE GUARDA DEFINIDO NO PARECER ÉTICO]]',
};

const TAREFAS = [
  'Tarefa 1 — Analisar uma amostra rápida e ver a classe sugerida',
  'Tarefa 2 — Ajustar a opacidade do mapa, usar o lado a lado e o zoom',
  'Tarefa 3 — Responder uma amostra no modo quiz',
  'Tarefa 4 — Reabrir uma análise no histórico',
];

// Itens da versão brasileira validada do System Usability Scale (LOURENÇO; CARMONA; LOPES, 2022,
// Aquichan, v. 22, n. 2, e2228, Tabela 1), transcritos sem alteração. "Sistema" = a ferramenta HistoLente.
// Ímpares positivos, pares negativos — não alterar a ordem (o cálculo do escore depende dela; BROOKE, 1996).
const SUS = [
  'Eu acho que gostaria de usar esse sistema frequentemente.',
  'Eu achei esse sistema desnecessariamente complexo.',
  'Eu achei esse sistema fácil de usar.',
  'Eu achei que precisaria de ajuda de uma pessoa técnica para ser capaz de usar esse sistema.',
  'Eu achei que as várias funções desse sistema foram bem integradas.',
  'Eu acho que o sistema apresenta muita inconsistência.',
  'Eu imagino que a maioria das pessoas pode aprender a usar esse sistema rapidamente.',
  'Eu achei esse sistema muito pesado para usar.',
  'Eu me senti muito seguro usando o sistema.',
  'Eu precisei aprender muitas coisas antes que pudesse utilizar esse sistema.',
];

function criarFormularioAvaliacao() {
  const form = FormApp.create('HistoLente — Avaliação do protótipo');
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false);
  form.setAllowResponseEdits(false);
  form.setProgressBar(true);
  try { form.setRequireLogin(false); } catch (e) { /* só em contas Workspace */ }
  form.setDescription(
    'Obrigado por testar o protótipo do HistoLente, uma ferramenta de estudo de padrões histológicos do câncer ' +
    'colorretal. Responda depois de fazer as 4 tarefas do protótipo (' + CONFIG.linkPrototipo + '). ' +
    'Leva cerca de 5 minutos. Não escreva seu nome nem dados de pacientes.'
  );

  form.addSectionHeaderItem().setTitle('Termo de Consentimento Livre e Esclarecido (TCLE)').setHelpText(textoTcle_());
  const aceite = form.addMultipleChoiceItem().setTitle('Você leu o termo acima e concorda em participar?').setRequired(true);
  form.addCheckboxItem().setTitle('Transferência internacional (LGPD, art. 33, VIII)')
    .setHelpText('As respostas ficam temporariamente em servidores do Google, que podem estar fora do Brasil.')
    .setChoiceValues(['Concordo com o armazenamento temporário das respostas em servidores do Google']).setRequired(true);
  form.addTextItem().setTitle('Palavra-código pessoal (opcional; serve só para você pedir a exclusão da sua resposta depois)');

  form.addPageBreakItem().setTitle('Perfil');
  form.addMultipleChoiceItem().setTitle('Você é:').setRequired(true)
    .setChoiceValues(['Estudante de Medicina', 'Professor(a) de Patologia', 'Profissional de laboratório', 'Outro']);
  form.addListItem().setTitle('Se estudante, em que período está?')
    .setChoiceValues(['1º', '2º', '3º', '4º', '5º', '6º', '7º', '8º', 'Internato', 'Não se aplica']);
  form.addMultipleChoiceItem().setTitle('Em que aparelho você fez o teste?').setRequired(true)
    .setChoiceValues(['Computador', 'Celular', 'Tablet']);
  form.addMultipleChoiceItem().setTitle('Você respondeu ao primeiro formulário desta pesquisa (sobre necessidades)?')
    .setChoiceValues(['Sim', 'Não', 'Não lembro']);

  form.addPageBreakItem().setTitle('Tarefas').setHelpText('Como foi cada tarefa?');
  form.addGridItem().setTitle('Resultado de cada tarefa').setRequired(true)
    .setRows(TAREFAS)
    .setColumns(['Consegui sem dificuldade', 'Consegui com alguma dificuldade', 'Não consegui']);
  form.addParagraphTextItem().setTitle('Se teve dificuldade em alguma tarefa, o que aconteceu?');

  form.addPageBreakItem().setTitle('Diferenciar e entender').setHelpText('Responda com base no que você viu no protótipo. Não há problema em errar.');
  form.addParagraphTextItem()
    .setTitle('Tarefa 5 — No modo quiz ou na galeria, compare estroma (STR) e músculo liso (MUS). Que critério você usou para diferenciar os dois?');
  form.addGridItem().setTitle('Verdadeiro ou falso?')
    .setRows([
      'O mapa de calor mostra onde está o tumor.',
      'Uma confiança de 86% garante que este tecido é dessa classe.',
      'O modelo sempre escolhe uma das 9 classes, mesmo que a imagem não seja de nenhuma delas.',
      'A ferramenta pode ser usada para fazer o laudo de um paciente.',
    ])
    .setColumns(['Verdadeiro', 'Falso', 'Não sei']);
  form.addScaleItem().setTitle('Quanto você confiaria na sugestão do modelo para estudar?').setBounds(1, 5).setLabels('Nada', 'Totalmente');

  form.addPageBreakItem().setTitle('Sua opinião sobre a ferramenta')
    .setHelpText('"Sistema" aqui é o protótipo do HistoLente que você acabou de usar. Para cada frase, marque de 1 (discordo totalmente) a 5 (concordo totalmente). Responda rápido, com sua primeira impressão.');
  form.addGridItem().setTitle('Questionário de usabilidade').setRequired(true)
    .setRows(SUS)
    .setColumns(['1 — Discordo totalmente', '2', '3', '4', '5 — Concordo totalmente']);

  form.addPageBreakItem().setTitle('Para terminar');
  form.addParagraphTextItem().setTitle('O que mais ajudou a entender a sugestão do modelo?');
  form.addParagraphTextItem().setTitle('O que mais atrapalhou ou faltou?');

  aceite.setChoices([
    aceite.createChoice('Li o termo e CONCORDO em participar', FormApp.PageNavigationType.CONTINUE),
    aceite.createChoice('NÃO concordo em participar', FormApp.PageNavigationType.SUBMIT),
  ]);
  form.setConfirmationMessage('Obrigado! Suas respostas foram registradas sem nome nem e-mail.');

  const planilha = SpreadsheetApp.create('Respostas — Avaliação do protótipo (HistoLente)');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, planilha.getId());
  try { form.setPublished(true); } catch (e) {}
  form.setAcceptingResponses(true);

  Logger.log('PARA PARTICIPANTES: ' + form.getPublishedUrl());
  Logger.log('EDIÇÃO: ' + form.getEditUrl());
  Logger.log('PLANILHA: ' + planilha.getUrl());
}

function textoTcle_() {
  return [
    'Pesquisa: Reconhecimento Automatizado de Padrões Histológicos em Câncer Colorretal com Inteligência Artificial: Uma Ferramenta de Apoio à Patologia Digital.',
    'Pesquisador: ' + CONFIG.pesquisador + ' (Engenharia de Software — Universidade de Vassouras, Campus Maricá). Orientador(a): ' + CONFIG.orientador + '.',
    '',
    'OBJETIVO: avaliar se o protótipo da ferramenta é fácil de usar e útil para o estudo de patologia.',
    'O QUE VOCÊ FARÁ: usar o protótipo seguindo 4 tarefas (cerca de 10 minutos) e responder este formulário (cerca de 5 minutos). Não há gravação de tela, áudio ou vídeo, e o protótipo não envia nenhum dado.',
    'JUSTIFICATIVA: faltam patologistas no Brasil e ferramentas que ajudem estudantes a reconhecer padrões histológicos; esta avaliação verifica se o protótipo é útil e compreensível para esse fim.',
    'RISCOS: mínimos — cansaço ou desconforto ao responder, e uma possibilidade remota de reidentificação pelo cruzamento do perfil com o horário da resposta, minimizada pela divulgação apenas agregada e pela guarda local protegida. Você pode deixar perguntas em branco e parar a qualquer momento, sem prejuízo.',
    'BENEFÍCIOS: indiretos — contribuir para uma ferramenta de apoio ao ensino de Patologia.',
    'SIGILO: o formulário não coleta nome nem e-mail. As respostas são pseudonimizadas (identificadas apenas por códigos) e usadas só nesta pesquisa, conforme a LGPD (Lei nº 13.709/2018). Os resultados são divulgados de forma agregada.',
    'VOLUNTARIEDADE: a participação é voluntária e não afeta notas, avaliações ou vínculos com a instituição. Não há pagamento nem custos. O pesquisador é estudante e não avalia nenhum participante.',
    'RESSARCIMENTO E INDENIZAÇÃO: não há despesas previstas; caso ocorram, serão ressarcidas, e eventuais danos decorrentes da pesquisa serão indenizados nos termos da legislação vigente.',
    'RETIRADA: você pode retirar seu consentimento a qualquer momento, inclusive depois do envio. Para isso, crie no início do formulário uma palavra-código pessoal (que não seja seu nome nem sua data de nascimento) e informe-a ao pesquisador pelo contato abaixo; a resposta correspondente será eliminada.',
    'ARMAZENAMENTO: as respostas são coletadas pelo Google Forms (servidores que podem ficar fora do Brasil), exportadas para arquivo local protegido, apagadas do Google após a consolidação e eliminadas em ' + CONFIG.prazoGuarda + '.',
    'A ferramenta é educacional e não faz diagnóstico (Res. CFM nº 2.454/2026). As imagens do protótipo são ilustrações, não lâminas reais.',
    'CONTATO: ' + CONFIG.contatoPesquisador + '. Comitê de Ética em Pesquisa: ' + CONFIG.cep + '.',
    '',
    'CÓPIA DO TERMO: baixe sua via em ' + CONFIG.linkTclePdf + ' ou salve/imprima esta página (Ctrl+P).',
  ].join('\n');
}
