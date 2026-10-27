export * from "./nodeTypes";
export * from "./tokens";
export * from "./components";
export * from "./document";
export * from "./resolve";

import { DesignTree } from "./nodeTypes";
import { DesignDocument, Screen, emptyDesignDocument } from "./document";

/** @deprecated usar validateDesignDocument. Valida un árbol de una sola pantalla (legacy). */
export function validateDesignTree(data: unknown) {
  return DesignTree.safeParse(data);
}

/**
 * Valida la salida del LLM (o del editor) contra el esquema completo
 * multi-pantalla. Es el validador que debe usar `generation-service` desde
 * la Fase 1 — ver ROADMAP.md "Generation Service: ... soporte desde el día
 * uno para generar múltiples pantallas enlazadas".
 */
export function validateDesignDocument(data: unknown) {
  return DesignDocument.safeParse(data);
}

/** Envuelve un `DesignTree` de una sola pantalla (legacy) como `DesignDocument` de una pantalla. */
export function migrateTreeToDocument(tree: DesignTree, screenName = "Screen 1"): DesignDocument {
  const doc = emptyDesignDocument(screenName);
  const screen: Screen = { ...doc.screens[0], root: tree.root };
  return { ...doc, screens: [screen] };
}
