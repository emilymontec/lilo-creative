import type { DesignDocument, Screen, NavigationLink, ComponentDefinition } from "@lilo/design-schema";

/**
 * Mapea entre el `DesignDocument` (forma que consume/produce el resto de la
 * plataforma) y las filas relacionales de `db/schema.sql`. El JSON completo
 * nunca se guarda como un solo blob: se descompone en `screens`,
 * `navigation_links` y `components` para poder consultar y versionar sin
 * reserializar todo el documento en cada autosave.
 */
export interface DesignRow {
  id: string;
  team_id: string;
  owner_id: string;
  name: string;
  schema_version: string;
  tokens: DesignDocument["tokens"];
}

export function toDesignDocument(
  design: DesignRow,
  screenRows: Array<{ id: string; name: string; order: number; root: unknown }>,
  navigationRows: NavigationLink[],
  componentRows: ComponentDefinition[]
): DesignDocument {
  const screens: Screen[] = screenRows
    .sort((a, b) => a.order - b.order)
    .map((s) => ({ id: s.id, name: s.name, order: s.order, root: s.root as Screen["root"] }));

  return {
    schemaVersion: "1.0",
    screens,
    navigation: navigationRows,
    components: componentRows,
    tokens: design.tokens,
  };
}

/** Descompone un DesignDocument validado en las filas que persisten en cada tabla. */
export function fromDesignDocument(designId: string, doc: DesignDocument) {
  return {
    design: { id: designId, tokens: doc.tokens, schema_version: doc.schemaVersion },
    screens: doc.screens.map((s) => ({ ...s, design_id: designId })),
    navigation: doc.navigation.map((n) => ({ ...n, design_id: designId })),
    components: doc.components.map((c) => ({ ...c, design_id: designId })),
  };
}
