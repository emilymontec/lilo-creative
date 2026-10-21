# @lilo/collaboration-service

> Edición simultánea multi-usuario (CRDT/Yjs), presencia en vivo y comentarios
> anclados a elementos del diseño. Parte del producto final (ver ROADMAP.md,
> Fase 3) — no es una funcionalidad condicional a demanda post-lanzamiento.

Puerto por defecto: `4005`

## Desarrollo

```bash
npm install
npm run dev
```

## Estado

Fase 3 del roadmap. Se construye apoyándose en el Spike B de Fase 0 (validación
de que el esquema de `@lilo/design-schema` es mergeable con CRDT sin pérdida de
datos en ediciones concurrentes del mismo nodo).

## Submódulos

- `src/crdt/` — documento compartido con Yjs, resolución de conflictos
- `src/websocket/` — servidor de sockets para presencia (cursores, selección
  compartida) y sincronización del árbol de diseño en tiempo real
- `src/comments/` — comentarios anclados a elementos, menciones y resolución
  de hilos (puede extraerse a `notification-service` el disparo de los emails)
