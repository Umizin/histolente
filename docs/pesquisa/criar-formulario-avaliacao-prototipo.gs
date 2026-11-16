/**
 * Formulário de avaliação do protótipo do HistoLente (teste remoto não moderado).
 * TCLE + perfil + resultado de cada tarefa + SUS (10 itens) + 2 perguntas abertas.
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
};

const TAREFAS = [
  'Tarefa 1 — Analisar uma amostra rápida e ver a classe sugerida',
  'Tarefa 2 — Ajustar a opacidade do mapa, usar o lado a lado e o zoom',
  'Tarefa 3 — Responder uma amostra no modo quiz',
  'Tarefa 4 — Reabrir uma análise no histórico',
];

// Itens do System Usability Scale (Brooke, 1996), adaptados para "esta ferramenta".
// Ímpares positivos, pares negativos — não alterar a ordem (o cálculo do escore depende dela).
const SUS = [
  'Eu acho que gostaria de usar esta ferramenta com frequência.',
  'Eu achei a ferramenta desnecessariamente complexa.',
  'Eu achei a ferramenta fácil de usar.',
  'Eu acho que precisaria do apoio de uma pessoa com conhecimentos técnicos para usar a ferramenta.',
  'Eu achei que as diversas funções da ferramenta estavam bem integradas.',
  'Eu achei que havia muita inconsistência na ferramenta.',
  'Eu imagino que a maioria das pessoas aprenderia a usar esta ferramenta rapidamente.',
  'Eu achei a ferramenta muito complicada de usar.',
  'Eu me senti muito confiante ao usar a ferramenta.',
  'Eu precisei aprender muitas coisas antes de conseguir usar a ferramenta.',
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

  form.addPageBreakItem().setTitle('Sua opinião sobre a ferramenta')
    .setHelpText('Para cada frase, marque de 1 (discordo totalmente) a 5 (concordo totalmente). Responda rápido, com sua primeira impressão.');
  form.addGridItem().setTitle('Questionário de usabilidade').setRequired(true)
    .setRows(SUS)
    .setColumns(['1 — Discordo totalmente', '2', '3', '4', '5 — Concordo totalmente']);

  form.addPageBreakItem().setTitle('Para terminar');
  form.addParagraphTextItem().setTitle('O que mais ajudou no estudo dos tecidos?');
  form.addParagraphTextItem().setTitle('O que mais atrapalhou ou faltou?');

  aceite.setChoices([
    aceite.createChoice('Li o termo e CONCORDO em participar', FormApp.PageNavigationType.CONTINUE),
    aceite.createChoice('NÃO concordo em participar', FormApp.PageNavigationType.SUBMIT),
  ]);
  form.setConfirmationMessage('Obrigado! Suas respostas foram registradas de forma anônima.');

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
    'RISCOS: mínimos — cansaço ou desconforto ao responder. Você pode deixar perguntas em branco e parar a qualquer momento, sem prejuízo.',
    'BENEFÍCIOS: indiretos — contribuir para uma ferramenta de apoio ao ensino de Patologia.',
    'SIGILO: o formulário não coleta nome nem e-mail. As respostas são identificadas apenas por códigos e usadas só nesta pesquisa, conforme a LGPD (Lei nº 13.709/2018). Os resultados são divulgados de forma agregada.',
    'VOLUNTARIEDADE: a participação é voluntária e não afeta notas, avaliações ou vínculos com a instituição. Não há pagamento nem custos.',
    'A ferramenta é educacional e não faz diagnóstico (Res. CFM nº 2.454/2026). As imagens do protótipo são ilustrações, não lâminas reais.',
    'CONTATO: ' + CONFIG.contatoPesquisador + '. Comitê de Ética em Pesquisa: ' + CONFIG.cep + '.',
    '',
    'CÓPIA DO TERMO: recomendamos salvar ou imprimir esta página (Ctrl+P).',
  ].join('\n');
}
