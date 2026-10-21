# @lilo/design-tree-service

> CRUD del árbol de diseño, versionado tipo Git (snapshots) y autosave. Fuente de verdad persistida en PostgreSQL (JSONB).

Puerto por defecto: `4002`

## Desarrollo

```bash
npm install
npm run dev
```

## Submódulos

- `src/models/` — modelos de datos (`designs`, `design_versions`, `components`)
- `src/routes/` — endpoints CRUD (`/designs`, `/designs/:id`, `/designs/:id/autosave`)
- `src/versioning/` — snapshots del árbol, diff entre versiones, undo/redo basado en historial

## Notas

- Alternativa de stack: Django REST Framework si el equipo prefiere Python.
- Tabla `designs` con columna `tree` (JSONB) — ver `docs/design-schema-spec.md`.

