import { z } from "zod";
import { DesignNode } from "./nodeTypes";
import { ComponentDefinition } from "./components";
import { DesignTokens, emptyDesignTokens } from "./tokens";

/** Una pantalla individual dentro de un proyecto multi-pantalla. `root` debe ser un nodo "frame". */
export const Screen = z.object({
  id: z.string(),
  name: z.string(),
  order: z.number().default(0),
  root: DesignNode,
});
export type Screen = z.infer<typeof Screen>;

/**
 * Enlace de navegación entre pantallas, derivado de los `onPress.toScreenId`
 * de los nodos del árbol — se puede recalcular, pero se persiste también
 * aquí de forma explícita para que el panel de "flujo" del editor y el
 * exportador (routing generado) no tengan que recorrer todo el árbol.
 */
export const NavigationLink = z.object({
  id: z.string(),
  fromScreenId: z.string(),
  triggerNodeId: z.string(),
  toScreenId: z.string(),
  mode: z.enum(["push", "replace", "modal"]).default("push"),
});
export type NavigationLink = z.infer<typeof NavigationLink>;

/**
 * Documento de diseño completo: el árbol de datos editable real que genera
 * la IA y que edita el usuario. Sustituye a `DesignTree` (legacy, una sola
 * pantalla) como fuente de verdad desde la Fase 1 — ver ROADMAP.md.
 */
export const DesignDocument = z.object({
  schemaVersion: z.literal("1.0"),
  screens: z.array(Screen).min(1),
  navigation: z.array(NavigationLink).default([]),
  components: z.array(ComponentDefinition).default([]),
  tokens: DesignTokens.default(emptyDesignTokens()),
});
export type DesignDocument = z.infer<typeof DesignDocument>;

/** Documento vacío con una sola pantalla en blanco — punto de partida para un proyecto nuevo. */
export function emptyDesignDocument(firstScreenName = "Screen 1"): DesignDocument {
  return {
    schemaVersion: "1.0",
    screens: [
      {
        id: crypto.randomUUID(),
        name: firstScreenName,
        order: 0,
        root: { id: crypto.randomUUID(), type: "frame", style: {}, children: [] },
      },
    ],
    navigation: [],
    components: [],
    tokens: emptyDesignTokens(),
  };
}
