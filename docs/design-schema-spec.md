# Design Schema Spec — v1

> **Documento fundacional del proyecto.** Este es el "próximo paso inmediato"
> según el roadmap (Fase 0, semana 3-4). El esquema aquí descrito vive
> implementado en `packages/design-schema/src/nodeTypes.ts`.

## 1. Principio

El árbol de diseño (`DesignTree`) es la **fuente de verdad** de todo el
sistema. La IA genera este árbol, el canvas lo renderiza y lo edita, y el
exportador lo convierte a código o a nodos de Figma. Nunca se genera
HTML/CSS como salida final de la IA.

## 2. Tipos de nodo soportados en v1

Deliberadamente acotado — resistir la tentación de cubrir todo desde el inicio:

| Tipo | Descripción | Hijos permitidos |
|---|---|---|
| `frame` | Contenedor raíz de una pantalla/artboard | sí |
| `stack` | Contenedor de layout (fila/columna, flexbox-like) | sí |
| `text` | Texto estático | no |
| `button` | Elemento interactivo con texto | no (texto vía `text` prop) |
| `image` | Imagen (placeholder o URL) | no |

## 3. Estructura

```ts
DesignTree {
  schemaVersion: "1.0",
  root: DesignNode
}

DesignNode {
  id: string,               // identificador único, estable entre ediciones
  type: "frame" | "stack" | "text" | "button" | "image",
  name?: string,             // nombre visible en el panel de capas
  style: {
    x, y, width?, height?,
    padding?, gap?,
    fill?: { type: "solid", color: string },  // color literal o token id
    radius?: number,
    fontSizeTokenId?: string,
  },
  text?: string,              // solo text/button
  componentId?: string,       // si es instancia de un componente maestro
  children: DesignNode[],
}
```

## 4. Reglas de anidamiento

- `text`, `button` e `image` son siempre nodos hoja (sin `children`).
- `frame` solo puede ser la raíz (`root`) de un `DesignTree`, no un hijo de otro nodo.
- `stack` puede anidar cualquier combinación de `stack`, `text`, `button`, `image`.
- Todo `id` debe ser único dentro del árbol completo (se usa para selección,
  undo/redo y sincronización canvas <-> JSON).

## 5. Design tokens (Fase 2)

A partir de Fase 2, `style.fill` y `style.fontSizeTokenId` pueden referenciar
un token global (`packages/design-schema` se extiende con `DesignTokens`)
en vez de un valor suelto, para permitir rebranding completo del diseño.

## 6. Componentes (Fase 2)

Un nodo puede marcarse como "componente maestro". Otros nodos lo referencian
vía `componentId` y heredan sus cambios (instancias con variantes, ej. botón
primario/secundario).

## 7. Versionado (Fase 2)

Cada guardado relevante genera un snapshot inmutable del `DesignTree`
completo (versionado tipo Git), gestionado por `design-tree-service`.
El undo/redo del editor opera sobre el historial de cambios del árbol, no
sobre el DOM.

## 8. Extensión futura (post-v1, no bloqueante para el MVP)

- Nuevos tipos de nodo: `input`, `icon`, `divider`, `list`
- Multi-pantalla con navegación (links entre `frame`s)
- Restricciones de layout más avanzadas (auto-layout completo estilo Figma)

## 9. Validación

Todo JSON generado por el LLM se valida con Zod
(`validateDesignTree` en `@lilo/design-schema`) antes de persistirse o
renderizarse. Gate de decisión del spike técnico: **~90%+ de generaciones
válidas con reintentos automáticos** antes de avanzar a Fase 1.
