import { z } from "zod";
import { DesignNode } from "./nodeTypes";

/**
 * Una variante de un componente (ej. botón "primary" / "secondary" /
 * "disabled"). `overrides` es un patch superficial sobre el `style`/`text`
 * del nodo raíz del componente maestro — no una copia completa del árbol,
 * para que un cambio en el maestro siga propagándose a todas las variantes.
 */
export const ComponentVariant = z.object({
  id: z.string(),
  name: z.string(),
  styleOverrides: z.record(z.string(), z.any()).default({}),
  textOverride: z.string().optional(),
});
export type ComponentVariant = z.infer<typeof ComponentVariant>;

/**
 * Componente reutilizable (Fase 2 del editor). Vive a nivel de proyecto
 * (DesignDocument), no de una pantalla — así se puede instanciar en
 * cualquier pantalla del flujo multi-pantalla.
 */
export const ComponentDefinition = z.object({
  id: z.string(),
  name: z.string(),
  root: DesignNode, // estructura maestra del componente
  variants: z.array(ComponentVariant).default([]),
  defaultVariantId: z.string().optional(),
});
export type ComponentDefinition = z.infer<typeof ComponentDefinition>;
