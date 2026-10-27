import sharp from "sharp";

/** Rasteriza un SVG (de `svgGenerator.ts`) a PNG — usado para descargas PNG y para thumbnails. */
export async function svgToPng(svg: string, widthPx?: number): Promise<Buffer> {
  let pipeline = sharp(Buffer.from(svg));
  if (widthPx) pipeline = pipeline.resize({ width: widthPx });
  return pipeline.png().toBuffer();
}

/** Thumbnail pequeño (200px de ancho) para la pantalla de "Mis diseños" — ver ROADMAP.md, Fase 4. */
export function generateThumbnail(svg: string): Promise<Buffer> {
  return svgToPng(svg, 200);
}
