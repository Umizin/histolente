/**
 * Cria o formulário de Elicitação de Requisitos (TCC — Paulo Victor Silva Gonçalves, UVS Maricá 2026)
 * com TCLE, aceite, perfis com desvio condicional, perguntas abertas e quadro de funcionalidades.
 * Também cria um formulário separado para contato (teste do protótipo), mantendo as respostas anônimas.
 *
 * COMO USAR
 * 1. Acesse https://script.google.com → "Novo projeto".
 * 2. Apague o conteúdo, cole este arquivo inteiro e salve.
 * 3. Preencha os campos [[...]] da constante CONFIG abaixo.
 * 4. Selecione a função "criarFormularios" e clique em "Executar" (autorize o acesso na 1ª vez).
 * 5. Abra "Registro de execução": os links do formulário (edição e resposta) e da planilha aparecem lá.
 * 6. Revise o formulário no Google Forms antes de enviar.
 */

const CONFIG = {
  pesquisador: 'Paulo Victor Silva Gonçalves',
  contatoPesquisador: '[[E-MAIL OU TELEFONE DO PESQUISADOR]]',
  orientador: '[[NOME DO(A) ORIENTADOR(A)]]',
  cep: '[[CONTATO DO CEP — ou remover a frase se o CEP for dispensado]]',
  linkTclePdf: '[[LINK PARA O PDF DO TCLE (opcional, para o participante baixar)]]',
};

function criarFormularios() {
  // ---------- Formulário de contato (separado, para manter anonimato) ----------
  const contato = FormApp.create('Teste do protótipo — contato (opcional)');
  contato.setDescription(
    'Deixe um contato se quiser testar o protótipo da ferramenta mais adiante. ' +
    'Este formulário é separado da pesquisa: seu contato não é ligado às suas respostas.'
  );
  contato.setCollectEmail(false);
  contato.addTextItem().setTitle('Nome e forma de contato (e-mail ou WhatsApp)').setRequired(true);
  contato.setConfirmationMessage('Obrigado! Entraremos em contato quando o protótipo estiver disponível.');

  // ---------- Formulário principal ----------
  const form = FormApp.create('Ferramenta de estudo em Patologia Digital — Pesquisa de necessidades');
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false); // evita exigir login Google
  form.setAllowResponseEdits(false);
  form.setShowLinkToRespondAgain(false);
  form.setProgressBar(true);
  try { form.setRequireLogin(false); } catch (e) { /* disponível apenas em contas Workspace */ }

  form.setDescription(
    'Olá! Sou Paulo Victor, aluno de Engenharia de Software da Universidade de Vassouras (Maricá).\n\n' +
    'No meu TCC, estou desenvolvendo uma FERRAMENTA DE ESTUDO que recebe uma imagem pequena de tecido do ' +
    'intestino grosso (corada em H&E) e sugere qual dos 9 tipos de tecido ela é — por exemplo tumor, mucosa ' +
    'normal, músculo, estroma, linfócitos, muco —, mostrando também um MAPA DE CALOR das regiões que mais ' +
    'pesaram na sugestão. A ferramenta é EDUCACIONAL e NÃO faz diagnóstico.\n\n' +
    'A ferramenta ainda não existe: suas respostas vão ajudar a definir o que ela deve ter. ' +
    'Leva cerca de 10 minutos. Não escreva seu nome, nomes de pacientes ou de instituições nas respostas.'
  );

  // ---------- Página 1: TCLE + aceite ----------
  form.addSectionHeaderItem()
    .setTitle('Termo de Consentimento Livre e Esclarecido (TCLE)')
    .setHelpText(textoTcle_());

  const aceite = form.addMultipleChoiceItem()
    .setTitle('Você leu o termo acima e concorda em participar?')
    .setRequired(true);

  // ---------- Página 2: Perfil ----------
  const pgPerfil = form.addPageBreakItem().setTitle('Seu perfil');
  const perfil = form.addMultipleChoiceItem().setTitle('Você é:').setRequired(true);

  // ---------- Página 3a: Estudante ----------
  const pgE = form.addPageBreakItem().setTitle('Perfil — Estudante de Medicina');
  form.addListItem().setTitle('Em que período você está?')
    .setChoiceValues(['1º', '2º', '3º', '4º', '5º', '6º', '7º', '8º', 'Internato (9º–12º)'])
    .setRequired(false);
  form.addMultipleChoiceItem().setTitle('Você já cursou Patologia?')
    .setChoiceValues(['Sim', 'Estou cursando', 'Ainda não']).setRequired(false);

  // ---------- Página 3b: Professor ----------
  const pgP = form.addPageBreakItem().setTitle('Perfil — Professor(a) de Patologia');
  form.addTextItem().setTitle('Há quanto tempo você leciona? (em anos)').setRequired(false);
  form.addMultipleChoiceItem().setTitle('Você também trabalha com laudos?')
    .setChoiceValues(['Sim', 'Não']).setRequired(false);

  // ---------- Página 3c: Profissional de laboratório ----------
  const pgL = form.addPageBreakItem().setTitle('Perfil — Profissional de laboratório');
  form.addMultipleChoiceItem().setTitle('Qual é a sua função?')
    .setChoiceValues(['Médico(a) patologista', 'Residente de Patologia', 'Técnico(a) em histologia', 'Biomédico(a)'])
    .showOtherOption(true).setRequired(false);
  form.addTextItem().setTitle('Há quanto tempo atua? (em anos)').setRequired(false);
  form.addMultipleChoiceItem().setTitle('O laboratório onde você atua tem scanner de lâminas ou câmera acoplada ao microscópio?')
    .setChoiceValues(['Scanner de lâminas', 'Câmera no microscópio', 'Ambos', 'Nenhum', 'Não sei'])
    .setRequired(false);

  // ---------- Página 4: Perguntas abertas ----------
  const pgPerguntas = form.addPageBreakItem()
    .setTitle('Suas experiências')
    .setHelpText('Responda com suas palavras. Você pode deixar perguntas em branco.');

  form.addParagraphTextItem()
    .setTitle('1. Qual é a sua maior dificuldade hoje para reconhecer tecidos e padrões histológicos?')
    .setHelpText('Se possível, dê um exemplo. Profissionais de laboratório: a qualidade ou a coloração da lâmina costuma atrapalhar?');
  form.addParagraphTextItem()
    .setTitle('2. Quais tecidos ou padrões você acha mais fáceis de confundir entre si?')
    .setHelpText('Exemplos: músculo × estroma, mucosa normal × tumor, necrose × linfócitos.');
  form.addParagraphTextItem()
    .setTitle('3. Como e quando você usaria uma ferramenta como essa?')
    .setHelpText('Para estudar, em aula, em treinamento, na rotina…');
  form.addParagraphTextItem()
    .setTitle('4. Um mapa de calor sobre a imagem, mostrando as regiões que mais influenciaram a sugestão, ajudaria ou atrapalharia você? Por quê?');
  form.addCheckboxItem()
    .setTitle('5. Que tipo de imagem você teria para enviar à ferramenta?')
    .setChoiceValues(['Lâmina digitalizada', 'Foto do microscópio pelo celular', 'Imagem de atlas ou de slide de aula'])
    .showOtherOption(true);
  form.addParagraphTextItem()
    .setTitle('6. O que essa ferramenta NÃO pode errar, ou não pode fazer, para você confiar nela?');

  // ---------- Página 5: Quadro de funcionalidades ----------
  form.addPageBreakItem().setTitle('Funcionalidades');
  form.addGridItem()
    .setTitle('7. Classifique cada funcionalidade')
    .setRows([
      'Percentual de confiança de cada um dos 9 tipos de tecido',
      'Mapa de calor com controle de transparência e comparação lado a lado',
      'Descrição dos critérios morfológicos e do que NÃO confundir',
      'Galeria com vários exemplos de cada tecido',
      'Modo quiz: eu respondo primeiro, depois vejo a resposta com o erro explicado',
      'Histórico e acompanhamento do meu progresso',
    ])
    .setColumns(['Essencial', 'Útil', 'Dispensável'])
    .setRequired(false);
  form.addParagraphTextItem()
    .setTitle('8. Faltou alguma funcionalidade ou observação importante? (opcional)');

  // ---------- Navegação condicional ----------
  aceite.setChoices([
    aceite.createChoice('Li o termo e CONCORDO em participar', FormApp.PageNavigationType.CONTINUE),
    aceite.createChoice('NÃO concordo em participar', FormApp.PageNavigationType.SUBMIT),
  ]);
  perfil.setChoices([
    perfil.createChoice('Estudante de Medicina', pgE),
    perfil.createChoice('Professor(a) de Patologia', pgP),
    perfil.createChoice('Profissional de laboratório (patologista, residente, técnico, biomédico)', pgL),
  ]);
  // Ao terminar a página do Estudante ou do Professor, pula direto para as perguntas.
  // (setGoToPage na quebra de página define o destino da página ANTERIOR a ela.)
  pgP.setGoToPage(pgPerguntas); // fim da página Estudante → Perguntas
  pgL.setGoToPage(pgPerguntas); // fim da página Professor → Perguntas
  // fim da página Profissional de laboratório → segue naturalmente para Perguntas

  form.setConfirmationMessage(
    'Obrigado pela participação! Suas respostas foram registradas de forma anônima.\n\n' +
    'Se quiser testar o protótipo mais adiante, deixe um contato neste formulário separado (opcional): ' +
    contato.getPublishedUrl()
  );

  // ---------- Planilha de respostas ----------
  const planilha = SpreadsheetApp.create('Respostas — Pesquisa de necessidades (Patologia Digital)');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, planilha.getId());

  // Versões recentes do Google Forms têm estado "publicado/não publicado"; garante que ambos aceitem respostas.
  [form, contato].forEach(function (f) {
    try { f.setPublished(true); } catch (e) { /* método inexistente nesta versão: o formulário já nasce publicado */ }
    f.setAcceptingResponses(true);
  });

  Logger.log('FORMULÁRIO — link para enviar aos participantes: ' + form.getPublishedUrl());
  Logger.log('FORMULÁRIO — link de edição: ' + form.getEditUrl());
  Logger.log('CONTATO — link de edição: ' + contato.getEditUrl());
  Logger.log('PLANILHA de respostas: ' + planilha.getUrl());
}

function textoTcle_() {
  return [
    'Título da pesquisa: Reconhecimento Automatizado de Padrões Histológicos em Câncer Colorretal com Inteligência Artificial: Uma Ferramenta de Apoio à Patologia Digital.',
    'Pesquisador responsável: ' + CONFIG.pesquisador + ' (Engenharia de Software — Universidade de Vassouras, Campus Maricá). Orientador(a): ' + CONFIG.orientador + '.',
    '',
    'OBJETIVO: entender as dificuldades no reconhecimento de padrões histológicos e as necessidades de estudantes, professores e profissionais de laboratório, para definir os requisitos de uma ferramenta educacional.',
    'O QUE VOCÊ FARÁ: responder a este formulário (cerca de 10 minutos). Não há gravação de áudio ou vídeo.',
    'RISCOS: mínimos — cansaço ou desconforto ao responder. Você pode deixar qualquer pergunta em branco e interromper a qualquer momento, sem prejuízo.',
    'BENEFÍCIOS: indiretos — contribuir para uma ferramenta de apoio ao ensino de Patologia.',
    'SIGILO: o formulário NÃO coleta seu nome nem seu e-mail. As respostas serão identificadas apenas por códigos (ex.: E01) e usadas somente nesta pesquisa, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Os resultados serão divulgados de forma agregada, sem identificar participantes.',
    'VOLUNTARIEDADE: a participação é voluntária e não afeta notas, avaliações ou vínculos com a instituição. Não há pagamento nem custos para você.',
    'CONTATO: ' + CONFIG.contatoPesquisador + '. Comitê de Ética em Pesquisa: ' + CONFIG.cep + '.',
    '',
    'CÓPIA DO TERMO: recomendamos salvar ou imprimir esta página (Ctrl+P) ou baixar o termo em: ' + CONFIG.linkTclePdf,
  ].join('\n');
}
