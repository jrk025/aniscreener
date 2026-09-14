import sharp from "sharp";

export class UnsupportedImageError extends Error {}

// Normalizes arbitrary uploads (HEIC, CMYK JPEG, palette PNG, oversized photos)
// into a plain RGB JPEG so the tagger model never chokes on encoding quirks.
export async function normalizeImage(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .rotate()
      .resize({ width: 1536, height: 1536, fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 92 })
      .toBuffer();
  } catch {
    throw new UnsupportedImageError("Couldn't read this image. Try a JPEG, PNG, or WebP file.");
  }
}
