# @lilo/editor-canvas

> Motor de canvas editable (Fase 1-2 del roadmap). Renderiza el `DesignTree`
> con Konva.js, maneja selección/drag/resize y sincroniza cada cambio de
> vuelta al JSON en tiempo real (`useDesignStore`).

## Estructura

- `src/canvas/` — renderer Konva, mapeo DesignNode -> primitivas visuales
- `src/store/` — estado global (Zustand): árbol actual, selección, historial
- `src/components/` — PromptBar, LayersPanel, PropertiesPanel, Toolbar
- `src/hooks/` — hooks de interacción (drag, resize, atajos de teclado)

## Desarrollo

```bash
npm install
npm run dev
```
