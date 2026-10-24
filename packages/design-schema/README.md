# @lilo/design-schema

> El esquema del árbol de diseño — **fuente de verdad** de toda la plataforma.
> Esquema v1 completo (sin recortes de MVP): tipos de nodo, componentes con
> variantes, design tokens y documentos multi-pantalla con navegación, todo
> definido desde la Fase 0 del roadmap.

Cualquier funcionalidad nueva (generación, edición, exportación, colaboración)
debe pasar por este esquema. La IA nunca devuelve HTML/CSS estático como
salida final: siempre devuelve un `DesignDocument` validado.

## Estructura del paquete

- `src/nodeTypes.ts` — `NodeType` (`frame`, `stack`, `text`, `button`, `image`,
  `input`, `icon`, `divider`), `DesignNode`, estilos y `NavigationAction`
- `src/tokens.ts` — `DesignTokens`: colores, tipografía y espaciados, con
  soporte de múltiples temas (ej. `light`/`dark`)
- `src/components.ts` — `ComponentDefinition` y `ComponentVariant` (botón
  primario/secundario/deshabilitado, etc.)
- `src/document.ts` — `DesignDocument`: el contenedor real de un proyecto —
  varias `Screen`s + `NavigationLink`s + `components` + `tokens`

## `DesignDocument` — la fuente de verdad real

```ts
DesignDocument {
  schemaVersion: "1.0",
  screens: Screen[],          // mínimo 1 — cada una con su `root` tipo "frame"
  navigation: NavigationLink[], // enlaces entre pantallas (derivados de onPress)
  components: ComponentDefinition[],
  tokens: DesignTokens,
}
```

Un proyecto de una sola pantalla sigue siendo válido: simplemente tiene
`screens.length === 1` y `navigation: []`.

## Uso

```ts
import { validateDesignDocument, emptyDesignDocument } from "@lilo/design-schema";

const result = validateDesignDocument(llmOutputJson);
if (!result.success) {
  // reintentar generación o devolver error estructurado
}

const blank = emptyDesignDocument("Pantalla 1"); // proyecto nuevo en blanco
```

## Compatibilidad hacia atrás

`DesignTree` (una sola pantalla, sin `schemaVersion` de documento) se
mantiene como tipo `@deprecated` y `migrateTreeToDocument()` lo convierte a
`DesignDocument`. Ningún código nuevo debe generar `DesignTree` directamente.

Ver el detalle completo de propiedades y reglas de anidamiento en
`docs/design-schema-spec.md`.
