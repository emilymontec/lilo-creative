import { z } from "zod";

/**
 * Tipos de nodo soportados en la v1 del esquema.
 * Deliberadamente acotado (ver ROADMAP.md, Fase 0): frame, texto, botón,
 * imagen y contenedor/stack. Resistir la tentación de cubrir todo desde el inicio.
 */
export const NodeType = z.enum(["frame", "text", "button", "image", "stack"]);
export type NodeType = z.infer<typeof NodeType>;

export const Fill = z.object({
  type: z.literal("solid"),
  // referencia a un design token o un color literal (#RRGGBB)
  color: z.string(),
});

export const BaseStyle = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  width: z.number().optional(),
  height: z.number().optional(),
  padding: z.number().optional(),
  gap: z.number().optional(),
  fill: Fill.optional(),
  radius: z.number().optional(),
  fontSizeTokenId: z.string().optional(), // referencia a design token
});

export const DesignNode: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: NodeType,
    name: z.string().optional(),
    style: BaseStyle.default({}),
    // solo nodos de tipo "text" o "button" usan texto
    text: z.string().optional(),
    // referencia a un componente maestro si este nodo es una instancia
    componentId: z.string().optional(),
    children: z.array(DesignNode).default([]),
  })
);
export type DesignNode = z.infer<typeof DesignNode>;

export const DesignTree = z.object({
  schemaVersion: z.literal("1.0"),
  root: DesignNode,
});
export type DesignTree = z.infer<typeof DesignTree>;
