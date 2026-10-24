import type { DesignDocument, DesignNode, BaseStyle } from "@lilo/design-schema";

/**
 * Resuelve una instancia de componente (`node.componentId` + `node.variantId`)
 * contra su maestro en `document.components`, aplicando los overrides de la
 * variante activa. Si el nodo no es una instancia, lo devuelve sin cambios.
 * Esto es lo que hace que editar el maestro (`updateComponentMaster`) se
 * propague a cada instancia sin tener que recorrer todas las pantallas.
 */
export function resolveInstance(node: DesignNode, document: DesignDocument): DesignNode {
  if (!node.componentId) return node;
  const master = document.components.find((c) => c.id === node.componentId);
  if (!master) return node;

  let effective: DesignNode = {
    ...master.root,
    id: node.id,
    style: { ...master.root.style, x: node.style?.x ?? master.root.style?.x, y: node.style?.y ?? master.root.style?.y },
    componentId: node.componentId,
    variantId: node.variantId,
    locked: node.locked,
    hidden: node.hidden,
    onPress: node.onPress ?? master.root.onPress,
  };

  if (node.variantId) {
    const variant = master.variants.find((v) => v.id === node.variantId);
    if (variant) {
      effective = {
        ...effective,
        style: { ...effective.style, ...(variant.styleOverrides as Partial<BaseStyle>) },
        text: variant.textOverride ?? effective.text,
      };
    }
  }
  return effective;
}

/** Resuelve un color de `style.fill`/`borderColor`: token (ej. "color.primary") o valor literal (#RRGGBB). */
export function resolveColor(colorRefOrLiteral: string | undefined, document: DesignDocument, fallback = "#CCCCCC"): string {
  if (!colorRefOrLiteral) return fallback;
  if (!colorRefOrLiteral.startsWith("color.")) return colorRefOrLiteral; // valor literal
  const theme = document.tokens.themes[document.tokens.defaultTheme];
  const token = theme?.colors.find((t) => t.id === colorRefOrLiteral);
  return token?.value ?? fallback;
}

export function resolveFill(style: BaseStyle | undefined, document: DesignDocument): string | undefined {
  if (!style?.fill) return undefined;
  return resolveColor(style.fill.color, document);
}
