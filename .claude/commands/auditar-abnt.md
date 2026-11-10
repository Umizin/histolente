---
description: Auditoria ABNT completa (NBR 14724, 6023, 10520, 6024) — citações órfãs, anos divergentes, DOIs quebrados, marcadores esquecidos, numeração de seções; corrige ou gera relatório
argument-hint: [arquivo-ou-diretório] [--aplicar]  (padrão: docs/; sem --aplicar gera só relatório)
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Agent
---

# /auditar-abnt — Auditoria ABNT e de consistência bibliográfica

**Argumentos:** `$ARGUMENTS`

- Alvo = primeiro argumento que não seja flag; padrão `docs/` (inclui `docs/monografia/*.md` e o Pré-TCC em PDF).
- Modo: `--aplicar` → aplica correções nos arquivos editáveis (`.md`, `.tex`, `.docx` via skill docx). Sem flag → **somente relatório**.
- **Nunca** modificar o PDF original `docs/TCC_Pré_ (1).pdf`. Se o alvo for apenas o PDF e `--aplicar` estiver presente, crie `docs/monografia/` com a conversão em Markdown (um arquivo por capítulo: `01-referencial-teorico.md`, `02-materiais-metodos.md`, `03-requisitos.md`, `04-arquitetura.md`, `99-referencias.md`), preservando o texto original, e aplique as correções nesses arquivos.

## Passo 1 — Extração
1. Leia `CLAUDE.md` (seções 5 e 6).
2. Para PDF: `pdftotext -layout`; para `.docx`: use a skill `anthropic-skills:docx` para ler; `.md`: leitura direta.
3. Construa duas listas estruturadas:
   - **Citações no texto**: `{autores, ano, local(seção/linha), forma (narrativa/parentética), trecho}`. Regex de apoio: `\b[A-ZÁ-Ú][a-zá-ú]+(?: (?:e|,) [A-ZÁ-Ú][a-zá-ú]+)*(?: et al\.)? \(\d{4}[a-z]?\)` e `\([A-ZÁ-Ú ]+(?:et al\.)?, \d{4}[a-z]?(?:, p\. \d+)?\)`.
   - **Referências**: `{sobrenome(s), ano, título, tipo, DOI/URL, acesso}`.

## Passo 2 — Verificações (todas obrigatórias)

### A. Consistência citação ↔ referência
1. Citação sem referência (órfã no texto).
2. Referência nunca citada (órfã na lista).
3. **Ano divergente** entre texto e referência (ex.: Pressman e Maxim 2021 × 2016).
4. Grafia de autores divergente; "et al." usado com < 3 autores ou ausente com ≥ 3 (NBR 10520:2023 permite "et al." a partir de 3 — padronizar).
5. Mesmo autor/ano com obras diferentes sem sufixo a/b.

### B. Marcadores e resíduos
- Colchetes órfãos (`\[\d+(\.\d+)*\]`, ex.: "[1.1]" na Seção 1.7), "[citação]", "XX", "TODO", "??", "Erro! Fonte de referência não encontrada", espaços duplos, aspas tipográficas misturadas.
- Erros de digitação/regência evidentes (ex.: "fornece o uma base", "consiste por meio de").

### C. Numeração progressiva (NBR 6024)
- Seções sem salto, sem duplicata, coerentes com o capítulo pai (ex.: "2.4 Requisitos não funcionais" dentro do Cap. 3 → **3.4**).
- Títulos sem ponto final; numeração arábica; sem numeração em elementos pré/pós-textuais (Referências, Apêndices).
- Figuras, tabelas e quadros numerados sequencialmente, com título acima e fonte abaixo; todos referenciados no texto.

### D. Referências (NBR 6023:2018)
Para cada referência, verificar elementos essenciais por tipo:
- **Livro:** SOBRENOME, Prenome. **Título**: subtítulo. Edição. Local: Editora, ano.
- **Artigo:** SOBRENOME, Prenome. Título do artigo. **Periódico**, Local (opcional), v., n., p. inicial-final, mês abreviado ano. DOI.
- **Evento:** ... In: NOME DO EVENTO, n., ano, local. **Anais/Proceedings** [...]. Local: Editora, ano. p.
- **Documento online/legislação/dataset:** + "Disponível em: URL. Acesso em: dd mmm. aaaa."
- DOI completo e válido (`https://doi.org/10....`). Para checar formato: regex `https://doi\.org/10\.\d{4,9}/\S+`. Se houver internet e o usuário permitir, confirme resolvendo `curl -sI https://doi.org/<doi>` (status 302/200).
- Destaque tipográfico consistente (negrito OU itálico, não ambos).
- Pontuação/espaçamento quebrado (ex.: Litjens "ScienceDirect v.42,p.60-88,dez.2017").
- Abreviação de meses conforme NBR 6023 (jan., fev., mar., abr., maio, jun., jul., ago., set., out., nov., dez.) — "mai." é incorreto; correto é **maio**.
- Ordem alfabética.

### E. Estrutura (NBR 14724:2011) e estilo
- Presença de elementos pré-textuais obrigatórios, Introdução, Objetivos, Conclusão, Apêndices (TCLE, roteiro, SUS).
- Tom impessoal (procurar "eu ", "nós ", "nosso", "a gente"); siglas definidas na 1ª ocorrência; estrangeirismos em itálico.

### F. Checklist conhecido
Confirmar status de cada item C1–C5b e A1–A14 da seção 6 do `CLAUDE.md`.

## Passo 3 — Saída

### Relatório (sempre)
1. **Resumo:** nº de problemas por categoria (A–F) e severidade.
2. **Tabela detalhada:** `# | Cat. | Severidade | Local (seção/linha) | Encontrado | Correção proposta | Norma`.
3. **Referências corrigidas** — lista completa reescrita em NBR 6023:2018, em ordem alfabética, pronta para colar. Correções já conhecidas:
   - Niazi, Parwani e Gurcan (2019): `Disponível em: https://doi.org/10.1016/S1470-2045(19)30154-8.`
   - Selvaraju et al. (2017), ICCV: `https://doi.org/10.1109/ICCV.2017.74`.
   - Litjens et al. (2017): `Medical Image Analysis, v. 42, p. 60-88, dez. 2017. Disponível em: https://doi.org/10.1016/j.media.2017.07.005.`
   - LeCun, Bengio e Hinton (2015): "mai." → "maio".
4. **Pendências que exigem decisão do autor** (ex.: Pressman 2016 vs 2021 — qual edição foi consultada?).

### Modo `--aplicar`
- Aplicar apenas correções inequívocas (marcadores, numeração, DOIs, formatação de referência, ano quando a edição estiver definida). Correções que dependem de decisão do autor → **não aplicar**, listar.
- Mostrar diff resumido por arquivo.
- Atualizar o checklist da seção 6 do `CLAUDE.md` (`[x]` + arquivo onde foi corrigido).
- Para reescritas de parágrafo, acionar o subagente `sub-redator-academico`.

## Regras
- Não inventar dados bibliográficos. Se um elemento essencial estiver faltando e não puder ser verificado, marque `[VERIFICAR: elemento]`.
- Preservar o conteúdo e a voz do autor; corrigir forma, não mérito.
