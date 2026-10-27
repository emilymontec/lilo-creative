import type { DesignDocument, DesignNode, Screen } from "@lilo/design-schema";
import { resolveInstance, resolveFill, resolveColor, resolveTypography } from "@lilo/design-schema";

/**
 * DesignDocument -> SVG de una pantalla (ver ROADMAP.md, Fase 4, "Semanas
 * 7-8: Exportación de assets"). Es SVG real (no una captura de pantalla):
 * se recorre el árbol igual que en `CanvasRenderer`/los generadores de
 * código, así que lo que se exporta como imagen coincide con lo editado.
 * `svgToPng` (abajo) rasteriza este SVG para descargas PNG y thumbnails.
 */
export function generateScreenSvg(screen: Screen, doc: DesignDocument): string {
  const width = screen.root.style?.width ?? 400;
  const height = screen.root.style?.height ?? 600;
  const body = renderNodeAsSvg(screen.root, doc, 0, 0);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n${body}\n</svg>`;
}

function renderNodeAsSvg(rawNode: DesignNode, doc: DesignDocument, parentX: number, parentY: number): string {
  const node = resolveInstance(rawNode, doc);
  if (node.hidden) return "";

  const x = parentX + (node.style?.x ?? 0);
  const y = parentY + (node.style?.y ?? 0);
  const width = node.style?.width ?? 100;
  const height = node.style?.height ?? 40;

  switch (node.type) {
    case "frame":
    case "stack": {
      const fill = resolveFill(node.style, doc);
      const bg = fill ? `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${node.style?.radius ?? 0}" fill="${fill}" />\n` : "";
      const children = (node.children ?? []).map((c) => renderNodeAsSvg(c, doc, x, y)).join("\n");
      return `${bg}${children}`;
    }
    case "text": {
      const typo = resolveTypography(node.style, doc);
      const fill = resolveFill(node.style, doc) ?? "#111111";
      return `<text x="${x}" y="${y + typo.fontSize}" font-family="${typo.fontFamily}" font-size="${typo.fontSize}" font-weight="${typo.fontWeight}" fill="${fill}">${escapeXml(node.text ?? "")}</text>`;
    }
    case "button": {
      const fill = resolveFill(node.style, doc) ?? "#6E56CF";
      return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${node.style?.radius ?? 6}" fill="${fill}" />
<text x="${x + width / 2}" y="${y + height / 2 + 5}" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" fill="#FFFFFF">${escapeXml(node.text ?? "Button")}</text>`;
    }
    case "input":
      return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${node.style?.radius ?? 4}" fill="#FFFFFF" stroke="#CCCCCC" />
<text x="${x + 8}" y="${y + height / 2 + 4}" font-family="Inter, sans-serif" font-size="14" fill="#999999">${escapeXml(node.placeholder ?? "")}</text>`;
    case "image":
      return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#E5E5E5" stroke="#BBBBBB" stroke-dasharray="4,4" />`;
    case "icon":
      return `<rect x="${x}" y="${y}" width="24" height="24" fill="none" stroke="#999999" />`;
    case "divider":
      return `<line x1="${x}" y1="${y}" x2="${x + width}" y2="${y}" stroke="${resolveColor(node.style?.borderColor, doc, "#DDDDDD")}" stroke-width="${node.style?.borderWidth ?? 1}" />`;
    default:
      return "";
  }
}

function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
