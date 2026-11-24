/** Ordem canônica = índice de saída do modelo. Não alterar. */
export const CLASSES = ["ADI", "BACK", "DEB", "LYM", "MUC", "MUS", "NORM", "STR", "TUM"] as const;
export type Classe = (typeof CLASSES)[number];

export const ehClasse = (v: unknown): v is Classe => typeof v === "string" && (CLASSES as readonly string[]).includes(v);

/** Nome, critérios morfológicos e armadilha de cada classe (texto revisado na sabatina clínica de 18/11/2026). */
export const INFO: Record<Classe, { nome: string; criterios: string; atencao: string }> = {
  ADI: { nome: "Tecido adiposo", criterios: "Adipócitos grandes, com citoplasma claro (o lipídio se dissolve no processamento) e núcleo achatado na periferia, formando uma rede de membranas finas.", atencao: "Não confundir com fundo (BACK) ou com espaços artefatuais." },
  BACK: { nome: "Fundo", criterios: "Área sem tecido: vidro, borda da lâmina, bolhas, sujidade. Não há estrutura celular.", atencao: "Não é tecido normal; gordura (ADI) ou muco (MUC) muito pálidos podem parecer fundo." },
  DEB: { nome: "Detritos / necrose", criterios: "Restos celulares, núcleos picnóticos e fragmentados (cariorrexe) e material eosinofílico amorfo; a necrose \"suja\" na luz glandular é típica do adenocarcinoma colorretal.", atencao: "Fragmentos nucleares podem lembrar linfócitos (LYM)." },
  LYM: { nome: "Linfócitos", criterios: "Células pequenas, redondas e uniformes, com núcleo denso e escuro de contorno liso que ocupa quase toda a célula; citoplasma escasso; alta densidade.", atencao: "Na necrose (DEB) os fragmentos nucleares são irregulares e de tamanhos variados." },
  MUC: { nome: "Muco", criterios: "Material extracelular pálido, azul-acinzentado, frouxo e pouco celular; pode conter células soltas. Comum no adenocarcinoma mucinoso.", atencao: "Pode lembrar edema do estroma ou fundo (BACK)." },
  MUS: { nome: "Músculo liso", criterios: "Feixes compactos de células fusiformes com citoplasma eosinofílico e fibrilar; núcleos alongados de pontas rombas (\"em charuto\"); em corte transversal, núcleos redondos com halo claro.", atencao: "Principal confusão com estroma (STR)." },
  NORM: { nome: "Mucosa colônica normal", criterios: "Criptas tubulares regulares e paralelas, ricas em células caliciformes; núcleos pequenos e basais (polaridade preservada); lâmina própria entre as criptas.", atencao: "Adenoma/displasia não é classe do modelo e pode sair como NORM ou TUM." },
  STR: { nome: "Estroma associado ao câncer", criterios: "Tecido conjuntivo desmoplásico com fibroblastos de núcleos finos, ondulados e afilados, dispersos em colágeno, às vezes frouxo ou mixoide; sem epitélio.", atencao: "Pode lembrar músculo liso (MUS); e estroma sozinho não prova câncer (fibrose comum pode ser sugerida como STR)." },
  TUM: { nome: "Epitélio de adenocarcinoma", criterios: "Glândulas irregulares, fusionadas ou cribriformes; núcleos grandes, hipercromáticos, pleomórficos e estratificados, com perda de polaridade; mitoses; poucas células caliciformes.", atencao: "Cripta normal em corte tangencial e adenoma podem parecer TUM." },
};

const DIFF: Record<string, string> = {
  "MUS|STR": "Músculo liso: células com citoplasma próprio, eosinofílico e fibrilar, em feixes compactos; núcleos \"em charuto\". Estroma desmoplásico: fibroblastos com núcleos finos e ondulados, separados por colágeno extracelular. Em recortes pequenos a distinção pode ser incerta até para o especialista.",
  "NORM|TUM": "Mucosa normal: criptas regulares e paralelas, muitas caliciformes, núcleos pequenos na base. Tumor: glândulas irregulares, fusionadas ou cribriformes, núcleos grandes e estratificados, perda de polaridade, mitoses e poucas caliciformes.",
  "DEB|LYM": "Linfócitos são redondos e uniformes; nos detritos há núcleos fragmentados de tamanhos variados em fundo eosinofílico amorfo.",
  "BACK|MUC": "Muco tem cor azul-acinzentada e textura frouxa, às vezes com células soltas; o fundo é vidro, sem cor nem textura.",
  "ADI|BACK": "Gordura forma uma rede de membranas finas com núcleos achatados na periferia; o fundo não tem membranas.",
  "MUC|STR": "Estroma tem fibroblastos e colágeno rosado; muco é pálido-azulado e quase sem células.",
  "DEB|TUM": "Na necrose não há glândulas íntegras nem núcleos viáveis organizados; no tumor, o epitélio atípico ainda forma glândulas.",
};

export function diferenca(a: Classe, b: Classe): string {
  return DIFF[[a, b].sort().join("|")] ?? `Compare os critérios de ${INFO[a].nome} e de ${INFO[b].nome}.`;
}

/** RN03: baixa confiança quando a classe principal tem menos de 60% (limiar provisório). */
export const LIMIAR_BAIXA_CONFIANCA = 0.6;

/** RN04: termos que nunca descrevem a saída do sistema. */
export const TERMOS_PROIBIDOS = ["diagnóstico", "laudo", "confirmado", "detecta câncer", "maligno", "benigno", "positivo", "negativo", "tumor encontrado"];
