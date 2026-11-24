import { createHash } from "node:crypto";
import sharp from "sharp";

export const TAMANHO = 224;
export const MAX_BYTES = 5 * 1024 * 1024;

/** RN01: tipo real pelo conteúdo (assinatura), não pela extensão. */
export function tipoReal(buf: Uint8Array): "image/png" | "image/jpeg" | null {
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  return null;
}

export const sha256 = (buf: Uint8Array): string => createHash("sha256").update(buf).digest("hex");

export class ImagemInvalida extends Error {}

/**
 * Valida e prepara a imagem: recorte central de 224×224 na escala original (RN01), em PNG,
 * sem metadados EXIF (RN08). Devolve também as dimensões originais.
 */
export async function prepararRecorte(buf: Buffer): Promise<{ recorte: Buffer; largura: number; altura: number }> {
  const img = sharp(buf, { limitInputPixels: 4096 * 4096 }).rotate();
  const meta = await img.metadata();
  const largura = meta.width ?? 0;
  const altura = meta.height ?? 0;
  if (largura < TAMANHO || altura < TAMANHO) throw new ImagemInvalida(`Imagem menor que ${TAMANHO}×${TAMANHO} px. Envie um recorte maior, sem reduzir a escala.`);
  const recorte = await img
    .extract({ left: Math.floor((largura - TAMANHO) / 2), top: Math.floor((altura - TAMANHO) / 2), width: TAMANHO, height: TAMANHO })
    .removeAlpha()
    .png()
    .toBuffer();
  return { recorte, largura, altura };
}
