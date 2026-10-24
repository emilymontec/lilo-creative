import type { DesignDocument } from "@lilo/design-schema";

/**
 * Crea un snapshot inmutable del documento completo (todas las pantallas,
 * navegación, componentes y tokens) para el historial de versiones.
 * El undo/redo del editor y la restauración de versiones operan sobre esto.
 */
export interface DesignVersion {
  id: string;
  designId: string;
  snapshot: DesignDocument;
  createdBy: string;
  createdAt: string;
  label?: string;
}

export function createSnapshot(designId: string, doc: DesignDocument, createdBy: string, label?: string): Omit<DesignVersion, "id" | "createdAt"> {
  return { designId, snapshot: doc, createdBy, label };
}
