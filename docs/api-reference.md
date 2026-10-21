# API Reference (borrador)

> Todas las rutas pasan por `gateway/api-gateway`. Formato: JSON. Auth: JWT
> (header `Authorization: Bearer <token>`) salvo donde se indique.

## Auth Service

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/register` | Registro de usuario |
| POST | `/auth/login` | Login, devuelve JWT |
| POST | `/auth/refresh` | Refresca el token |
| GET | `/teams` | Equipos del usuario autenticado |

## Generation Service

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/generation` | `{ prompt }` -> `DesignTree` generado y validado |

## Design Tree Service

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/designs` | Lista de diseños del usuario |
| POST | `/designs` | Crea un diseño vacío o desde un `DesignTree` |
| GET | `/designs/:id` | Obtiene un diseño |
| PUT | `/designs/:id` | Actualiza el árbol (autosave) |
| GET | `/designs/:id/versions` | Historial de snapshots |
| POST | `/designs/:id/versions/:versionId/restore` | Restaura una versión |

## Export Service

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/export/:id/code` | `DesignTree` -> componentes React + Tailwind |
| GET | `/export/:id/image` | Exporta como PNG/SVG |
| POST | `/export/:id/figma` | Envía el diseño a Figma vía su API REST |

## Billing Service

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/billing/checkout` | Inicia checkout de Stripe |
| POST | `/billing/webhook` | Webhook de eventos de Stripe |
| GET | `/billing/usage` | Uso actual vs límite del plan |

## Collaboration Service

| Método | Ruta | Descripción |
|---|---|---|
| WS | `/ws/designs/:id` | Sincronización CRDT en tiempo real |
| GET | `/designs/:id/comments` | Comentarios anclados a elementos |
| POST | `/designs/:id/comments` | Nuevo comentario |

> Nota: esta referencia es un borrador vivo — se actualiza a medida que
> `docs/design-schema-spec.md` y cada servicio maduran.
