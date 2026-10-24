# @lilo/editor-canvas

> Motor de canvas editable (Fase 1-2 del roadmap). Renderiza el `DesignTree`
> con Konva.js, maneja selección/drag/resize y sincroniza cada cambio de
> vuelta al JSON en tiempo real (`useDesignStore`).

## Estructura

- `src/canvas/` — renderer Konva, mapeo DesignNode -> primitivas visuales (renderiza la pantalla activa)
- `src/store/` — estado global (Zustand): `DesignDocument` completo (todas las pantallas), pantalla activa, selección
- `src/components/` — `ScreensTabs` (navegación entre pantallas), PromptBar, LayersPanel, PropertiesPanel, Toolbar
- `src/hooks/` — hooks de interacción (drag, resize, atajos de teclado)

El store mantiene el `DesignDocument` completo en memoria, no solo la
pantalla visible — así cambiar de pantalla con `ScreensTabs` no pierde el
estado de las demás, y las mutaciones (`updateNode`) son operaciones
localizadas por pantalla + id de nodo, pensadas para ser compatibles con la
sincronización CRDT de la Fase 3 del roadmap.

## Fase 2 implementada: capas, componentes, tokens e historial

- `store/treeUtils.ts` — operaciones inmutables sobre el árbol: mover entre
  hermanos, agrupar/desagrupar (envolver en un `stack`), duplicar con ids
  nuevos, bloquear/ocultar
- `store/historyStore.ts` — undo/redo por snapshots del `DesignDocument`
  (toda mutación de `designStore` pasa por `mutateScreenRoot`/`mutateDocument`,
  que registran el estado anterior automáticamente)
- `components/LayersPanel.tsx` — árbol de capas con reordenar, bloquear/
  ocultar y desagrupar
- `components/ComponentsPanel.tsx` — convertir selección en componente,
  agregar variantes
- `components/TokensPanel.tsx` — tokens de color por tema, cambio de tema
  por defecto
- `components/PropertiesPanel.tsx` — edita el nodo seleccionado, con el
  color de relleno seleccionable desde los tokens del proyecto
- `hooks/useKeyboardShortcuts.ts` — Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, Ctrl/Cmd+D
  (duplicar), Supr (eliminar), flechas (mover 1px, Shift+flecha 10px)

Fase 2 cerrada: `CanvasRenderer` ya mapea los 8 tipos de nodo a primitivas de
Konva (incluida resolución de instancias de componente contra su maestro +
variante), con drag para mover, selección simple y múltiple (Shift+click,
tanto en el canvas como en `LayersPanel`) y modo preview (los botones con
`onPress` navegan en vez de seleccionar). Pendiente real: handles de resize
(hoy el tamaño se edita desde `PropertiesPanel`) y auto-layout completo para
`stack` (el actual es una fila/columna simple, ver comentario en
`CanvasRenderer.tsx`).

## Fase 3: colaboración en tiempo real

- `hooks/useCollaboration.ts` — conecta a la sala de `collaboration-service`
  vía `y-websocket`, hidrata el store con el documento compartido y empuja
  los cambios locales de vuelta
- `components/PresenceBar.tsx` — avatares de los clientes conectados (Yjs Awareness)
- `components/CommentsPanel.tsx` — comentarios anclados al nodo seleccionado

**Limitación conocida, documentada también en el propio hook:** el merge
granular por nodo que ofrece el `Y.Doc` del servidor no se aprovecha del
todo todavía en el cliente — `useCollaboration` empuja el `root` completo de
la pantalla activa en cada cambio local, así que el merge real hoy es por
pantalla, no por nodo individual. Dos personas editando pantallas distintas
nunca chocan; dos personas editando la misma pantalla a la vez sí pueden
pisarse esa pantalla completa. Cerrar esa brecha es el siguiente paso de
Fase 3: hacer que las mutaciones de `designStore` escriban directamente
sobre el `Y.Doc` (vía `syncNodeIntoYMap` de `@lilo/collab-schema`) en vez de
sobre un árbol JS plano que se empuja entero.

## Desarrollo

```bash
npm install
npm run dev
```
