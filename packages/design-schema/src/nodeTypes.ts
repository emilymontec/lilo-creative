import { z } from "zod";

/**
 * Tipos de nodo soportados en el esquema v1 completo (ver ROADMAP.md, Fase 0
 * y Fase 1). A diferencia de un esquema recortado para MVP, se incluyen desde
 * el inicio los tipos necesarios para formularios básicos ("input"), iconografía
 * ("icon") y separadores de layout ("divider"), porque son comunes en casi
 * cualquier flujo generado (onboarding, dashboards, checkout).
 */
export const NodeType = z.enum([
  "frame",
  "stack",
  "text",
  "button",
  "image",
  "input",
  "icon",
  "divider",
]);
export type NodeType = z.infer<typeof NodeType>;

export const Fill = z.object({
  type: z.literal("solid"),
  // referencia a un design token (ej. "color.primary") o un color literal (#RRGGBB)
  color: z.string(),
});

export const Direction = z.enum(["row", "column"]);
export const Alignment = z.enum(["start", "center", "end", "stretch", "space-between"]);

export const BaseStyle = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  width: z.number().optional(),
  height: z.number().optional(),
  padding: z.number().optional(),
  gap: z.number().optional(),
  fill: Fill.optional(),
  radius: z.number().optional(),
  opacity: z.number().min(0).max(1).optional(),
  borderWidth: z.number().optional(),
  borderColor: z.string().optional(), // token id o color literal
  // layout (solo aplica a "stack")
  direction: Direction.optional(),
  align: Alignment.optional(),
  justify: Alignment.optional(),
  // tipografía (referencias a tokens, ver tokens.ts)
  fontSizeTokenId: z.string().optional(),
  typographyTokenId: z.string().optional(),
});
export type BaseStyle = z.infer<typeof BaseStyle>;

/**
 * Acción de navegación disparada por un nodo interactivo (típicamente
 * "button"). Permite flujos multi-pantalla sin que el árbol de un nodo
 * tenga que conocer el árbol de otra pantalla — solo referencia su id.
 */
export const NavigationAction = z.object({
  type: z.literal("navigate"),
  toScreenId: z.string(),
  mode: z.enum(["push", "replace", "modal"]).default("push"),
});
export type NavigationAction = z.infer<typeof NavigationAction>;

export const DesignNode: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: NodeType,
    name: z.string().optional(),
    style: BaseStyle.default({}),
    // "text", "button" e "input" (como placeholder) usan texto
    text: z.string().optional(),
    placeholder: z.string().optional(), // solo "input"
    iconName: z.string().optional(), // solo "icon" — referencia a un set de iconos conocido
    src: z.string().optional(), // solo "image" — URL o placeholder
    // referencia a un componente maestro si este nodo es una instancia de un componente
    componentId: z.string().optional(),
    variantId: z.string().optional(), // variante aplicada, si componentId está presente
    // acción al interactuar (botones principalmente) — habilita flujos multi-pantalla
    onPress: NavigationAction.optional(),
    // estado del panel de capas (Fase 2 del editor): no afecta el render final,
    // solo la edición — un nodo oculto/bloqueado se exporta igual que uno visible
    locked: z.boolean().optional(),
    hidden: z.boolean().optional(),
    // "text", "button", "image", "input", "icon" y "divider" son siempre hojas;
    // "frame" y "stack" aceptan hijos
    children: z.array(DesignNode).default([]),
  })
);
export type DesignNode = z.infer<typeof DesignNode>;

/** @deprecated usar DesignDocument (src/document.ts) — se mantiene por compatibilidad con integraciones de una sola pantalla. */
export const DesignTree = z.object({
  schemaVersion: z.literal("1.0"),
  root: DesignNode,
});
export type DesignTree = z.infer<typeof DesignTree>;
