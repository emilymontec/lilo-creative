# @lilo/design-tree-service

> CRUD del `DesignDocument` multi-pantalla (`@lilo/design-schema`), versionado
> tipo Git (snapshots) y autosave. Fuente de verdad persistida en PostgreSQL.

Puerto por defecto: `4002`

## Modelo de datos

El `DesignDocument` no se guarda como un solo blob JSON: se descompone en
tablas relacionales (`designs`, `screens`, `navigation_links`, `components`)
y cada árbol de pantalla (`screens.root`) sí vive en JSONB. Esto permite
listar/filtrar pantallas y componentes sin parsear el documento completo, y
mantiene `design_versions` como snapshots inmutables del documento entero
para undo/redo y restauración de versiones.

Ver `src/db/schema.sql` para el DDL completo y `src/models/designDocument.ts`
para el mapeo `DesignDocument <-> filas relacionales`.

## Desarrollo

```bash
npm install
npm run dev
```

## Submódulos

- `src/db/schema.sql` — DDL de PostgreSQL (designs, screens, navigation_links, components, design_versions)
- `src/models/` — mapeo DesignDocument <-> filas relacionales
- `src/routes/` — endpoints CRUD (`/designs`, `/designs/:id`, `/designs/:id/versions`), validados contra `@lilo/design-schema` antes de persistir
- `src/versioning/` — creación de snapshots para el historial de versiones

## Notas

- Alternativa de stack: Django REST Framework si el equipo prefiere Python.
