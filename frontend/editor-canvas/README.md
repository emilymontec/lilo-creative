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

Pendiente para cerrar la Fase 2 por completo: multi-selección en el canvas
(hoy `groupNodes` ya acepta varios ids, pero la UI para seleccionar varios
nodos a la vez en el `Stage` de Konva todavía no está conectada) y el
mapeo real de `DesignNode` -> primitivas Konva en `CanvasRenderer`.

## Desarrollo

```bash
npm install
npm run dev
```
