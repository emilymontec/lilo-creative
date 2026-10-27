import type { BaseStyle, DesignDocument } from "@lilo/design-schema";
import { resolveColor } from "@lilo/design-schema";

/**
 * Convierte un `BaseStyle` del esquema a clases de Tailwind. Usa valores
 * arbitrarios (`w-[123px]`, `bg-[#RRGGBB]`) en vez de intentar mapear a la
 * escala por defecto de Tailwind (`w-4`, `w-8`...) — el valor que trae el
 * nodo es un número libre (viene de generación por IA o de arrastrar en el
 * canvas), no un múltiplo de la escala de Tailwind, así que forzarlo a la
 * escala perdería precisión frente al diseño real.
 */
export function styleToTailwindClasses(
  style: BaseStyle | undefined,
  document: DesignDocument,
  opts: { isPositioningRoot?: boolean } = {}
): string {
  if (!style) return opts.isPositioningRoot ? "relative" : "";
  const classes: string[] = [];
  // La pantalla (nodo "frame" raíz) es el contexto de posicionamiento de sus
  // hijos absolutos, no un elemento posicionado en sí mismo.
  if (opts.isPositioningRoot) classes.push("relative");

  if (style.width !== undefined) classes.push(`w-[${style.width}px]`);
  if (style.height !== undefined) classes.push(`h-[${style.height}px]`);
  if (style.padding !== undefined) classes.push(`p-[${style.padding}px]`);
  if (style.gap !== undefined) classes.push(`gap-[${style.gap}px]`);
  if (style.radius !== undefined) classes.push(`rounded-[${style.radius}px]`);
  if (style.opacity !== undefined) classes.push(`opacity-[${style.opacity}]`);
  if (style.borderWidth !== undefined) classes.push(`border-[${style.borderWidth}px]`);
  if (style.borderColor) classes.push(`border-[${resolveColor(style.borderColor, document)}]`);
  if (style.fill) classes.push(`bg-[${resolveColor(style.fill.color, document)}]`);

  if (style.direction) {
    classes.push(style.direction === "row" ? "flex flex-row" : "flex flex-col");
    if (style.align) classes.push(`items-${mapAlign(style.align)}`);
    if (style.justify) classes.push(`justify-${mapJustify(style.justify)}`);
  }

  // Posicionamiento absoluto (el canvas trabaja con x/y absolutos dentro del padre),
  // salvo para el propio nodo raíz de la pantalla (ver `isPositioningRoot` arriba).
  if (!opts.isPositioningRoot && (style.x !== undefined || style.y !== undefined)) {
    classes.push("absolute");
    if (style.x !== undefined) classes.push(`left-[${style.x}px]`);
    if (style.y !== undefined) classes.push(`top-[${style.y}px]`);
  }

  return classes.join(" ");
}

function mapAlign(align: string): string {
  return { start: "start", center: "center", end: "end", stretch: "stretch", "space-between": "stretch" }[align] ?? "start";
}
function mapJustify(justify: string): string {
  return { start: "start", center: "center", end: "end", stretch: "stretch", "space-between": "between" }[justify] ?? "start";
}
