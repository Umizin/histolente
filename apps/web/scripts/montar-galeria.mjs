// Monta a galeria de amostras (RF01) a partir do CRC-VAL-HE-7K (Kather et al., 2018; CC BY 4.0).
// Sorteio reprodutível (semente fixa), sem escolha manual: N imagens por classe, convertidas para PNG.
// O nome do arquivo e o id não revelam a classe (o rótulo só aparece depois do resultado).
// Depois da galeria, o mesmo sorteio continua e monta o banco do modo quiz (HU13), sem repetir imagens da galeria.
// Uso: node scripts/montar-galeria.mjs /caminho/CRC-VAL-HE-7K [por_classe=2] [quiz_por_classe=5]
import { createHash } from "node:crypto";
import { readdir, mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const CLASSES = ["ADI", "BACK", "DEB", "LYM", "MUC", "MUS", "NORM", "STR", "TUM"];
const [origem, porClasseArg, quizArg] = process.argv.slice(2);
if (!origem) { console.error("uso: node scripts/montar-galeria.mjs /caminho/CRC-VAL-HE-7K [por_classe]"); process.exit(1); }
const porClasse = Number(porClasseArg ?? 2);
const quizPorClasse = Number(quizArg ?? 5);
const raiz = path.join(path.dirname(new URL(import.meta.url).pathname), "..");
const destino = path.join(raiz, "public", "galeria");
// o manifesto (com a classe) fica fora de public/ para não ser servido ao navegador
const manifestoPath = path.join(raiz, "galeria", "manifest.json");
const destinoQuiz = path.join(raiz, "public", "quiz");
const manifestoQuizPath = path.join(raiz, "galeria", "quiz.json");

// gerador congruente linear simples, semente fixa: o sorteio é o mesmo em qualquer máquina
let semente = 20261124;
const aleatorio = () => ((semente = (semente * 1103515245 + 12345) % 2147483648) / 2147483648);

await rm(destino, { recursive: true, force: true });
await mkdir(destino, { recursive: true });
await rm(destinoQuiz, { recursive: true, force: true });
await mkdir(destinoQuiz, { recursive: true });
const usados = new Set();
async function sortear(quantos, pasta) {
  const lista = [];
  for (const classe of CLASSES) {
    const arquivos = (await readdir(path.join(origem, classe))).filter((a) => /\.tif$/i.test(a)).sort();
    const escolhidos = [];
    while (escolhidos.length < quantos && usados.size < 1e6) {
      const a = arquivos[Math.floor(aleatorio() * arquivos.length)];
      if (!usados.has(`${classe}/${a}`)) { usados.add(`${classe}/${a}`); escolhidos.push(a); }
    }
    for (const a of escolhidos) {
      const id = createHash("sha256").update(`${classe}/${a}`).digest("hex").slice(0, 12);
      await sharp(path.join(origem, classe, a)).png().toFile(path.join(pasta, `${id}.png`));
      lista.push({ id, arquivo: `${id}.png`, classe, origem: `CRC-VAL-HE-7K/${classe}/${a}` });
    }
  }
  return lista.sort((x, y) => x.id.localeCompare(y.id)); // ordem não agrupa por classe
}
const manifesto = await sortear(porClasse, destino);
const quiz = await sortear(quizPorClasse, destinoQuiz);
await mkdir(path.dirname(manifestoPath), { recursive: true });
await writeFile(manifestoPath, JSON.stringify(manifesto, null, 1) + "\n");
await writeFile(manifestoQuizPath, JSON.stringify(quiz, null, 1) + "\n");
await writeFile(path.join(destino, "LICENCA.md"), `# Galeria de amostras

Imagens do conjunto CRC-VAL-HE-7K, distribuído com o NCT-CRC-HE-100K:

KATHER, Jakob Nikolas; HALAMA, Niels; MARX, Alexander. 100,000 histological images of human colorectal cancer
and healthy tissue. Zenodo, 2018. https://doi.org/10.5281/zenodo.1214456. Licença CC BY 4.0
(https://creativecommons.org/licenses/by/4.0/).

Alteração: conversão de TIFF para PNG, sem outra modificação. Sorteio de ${porClasse} imagens por classe com semente
fixa (scripts/montar-galeria.mjs). O arquivo apps/web/galeria/manifest.json registra a imagem de origem de cada amostra.
`);
await writeFile(path.join(destinoQuiz, "LICENCA.md"), `# Banco do modo quiz

Imagens do conjunto CRC-VAL-HE-7K (Kather et al., 2018; https://doi.org/10.5281/zenodo.1214456), licença CC BY 4.0
(https://creativecommons.org/licenses/by/4.0/). Alteração: conversão de TIFF para PNG. Sorteio de ${quizPorClasse} imagens
por classe com semente fixa, sem repetir as da galeria (scripts/montar-galeria.mjs). O rótulo de cada imagem fica em
apps/web/galeria/quiz.json, que não é servido ao navegador.
`);
console.log(`${manifesto.length} amostras em ${destino}; ${quiz.length} no quiz em ${destinoQuiz}`);
