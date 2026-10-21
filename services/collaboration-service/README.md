# @lilo/collaboration-service

> [POST-MVP / Fase 3+] Edición simultánea multi-usuario (CRDT/Yjs) y comentarios anclados a elementos del diseño.

Puerto por defecto: `4005`

## Desarrollo

```bash
npm install
npm run dev
```

## Estado: post-MVP

Según el roadmap, la colaboración en tiempo real se evalúa **después** del
lanzamiento, según demanda real de usuarios beta. Los comentarios async
(Fase 3) sí forman parte del MVP de colaboración y pueden vivir aquí o en
`design-tree-service` si se prefiere no levantar el servicio completo antes
de tiempo.

## Submódulos

- `src/crdt/` — documento compartido con Yjs, resolución de conflictos
- `src/websocket/` — servidor de sockets para presencia y sincronización

