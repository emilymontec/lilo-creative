export * from "./nodeTypes";

import { DesignTree } from "./nodeTypes";

/** Valida un árbol de diseño generado por el LLM contra el esquema v1. */
export function validateDesignTree(data: unknown) {
  return DesignTree.safeParse(data);
}
