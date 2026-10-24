# @lilo/collaboration-service

> Edición simultánea multi-usuario (CRDT/Yjs), presencia en vivo y comentarios
> anclados a elementos del diseño. Parte del producto final (ver ROADMAP.md,
> Fase 3) — no es una funcionalidad condicional a demanda post-lanzamiento.

Puerto por defecto: `4005` · WebSocket de colaboración: `ws://localhost:4005/ws/designs?designId=<id>`

## Cómo funciona

Cada `designId` tiene una "sala" (`src/crdt/room.ts`): un `Y.Doc` compartido
construido con `@lilo/collab-schema` a partir del `DesignDocument` actual, más
su `Awareness` (presencia) y el conjunto de conexiones WebSocket activas. El
servidor implementa el protocolo de cable estándar de Yjs (`src/websocket/syncProtocol.ts`,
compatible con el cliente `WebsocketProvider` de la librería `y-websocket`):
aplica cada update entrante al `Y.Doc` de la sala y lo retransmite al resto
de clientes de esa sala. Cada ~10s se persiste un snapshot en
`design-tree-service` (autosave colaborativo).

## Submódulos

- `src/crdt/room.ts` — salas en memoria (un Y.Doc + Awareness por diseño), carga y persistencia de snapshots
- `src/websocket/syncProtocol.ts` — codifica/decodifica los mensajes de sync (`y-protocols/sync`) y presencia (`y-protocols/awareness`)
- `src/websocket/server.ts` — servidor `ws` montado sobre el HTTP server de Fastify; gestiona conexiones, retransmisión y limpieza de presencia al desconectar
- `src/comments/` — modelo, rutas REST y extracción de menciones (`@usuario`) de comentarios anclados
- `src/db/schema.sql` — tabla `comments`

## Desarrollo

```bash
npm install
npm run dev
```

## Limitación conocida (ver `@lilo/collab-schema`)

El merge granular hoy es por nodo completo, no por campo individual: dos
ediciones concurrentes sobre *nodos distintos* (o pantallas distintas)
mergean sin conflicto; dos ediciones concurrentes sobre el *mismo nodo* se
resuelven por última escritura gana a nivel de ese nodo. Pasar a merge por
campo es un cambio aislado en `@lilo/collab-schema`, no en este servicio.

## Escalado (pendiente de Fase 7)

Las salas viven en memoria del proceso. Con más de una instancia del
servicio detrás de un load balancer, los clientes de una misma sala podrían
caer en instancias distintas y dejar de verse entre sí — se necesita un
backend de Awareness/Yjs compartido entre instancias (ej. Redis pub/sub)
antes de escalar horizontalmente este servicio.
