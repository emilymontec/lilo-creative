# @lilo/design-schema

> El esquema JSON del árbol de diseño — **fuente de verdad** de toda la plataforma.

Cualquier funcionalidad nueva (generación, edición, exportación) debe pasar por
este esquema. La IA nunca devuelve HTML/CSS estático como salida final: siempre
devuelve un árbol validado contra `DesignTree`.

## Tipos de nodo (v1)

`frame` · `text` · `button` · `image` · `stack` (contenedor)

Ver el detalle completo de propiedades y reglas de anidamiento en
`docs/design-schema-spec.md` (documento fundacional del proyecto — próximo paso
inmediato según el roadmap).

## Uso

```ts
import { validateDesignTree } from "@lilo/design-schema";

const result = validateDesignTree(llmOutputJson);
if (!result.success) {
  // reintentar generación o devolver error estructurado
}
```
