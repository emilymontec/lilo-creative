# Arquitectura — Lilo Creative

## Visión

Plataforma de generación de diseños UI/UX por IA donde cada elemento es
editable directamente sobre un canvas. Diferenciador: generamos un **árbol
de datos editable**, no imágenes ni código cerrado.

Referencias de producto:

- **Figma** — motor de edición y modelo de datos de nodos
- **Google Stitch** — generación por IA a partir de prompts
- **Galileo AI / Uizard** — generación de UI editable
- **v0.dev** — generación de código a partir de diseño
- **Framer** — exportación diseño-a-código en producción

## Diagrama de alto nivel

```
                        ┌─────────────────┐
                        │   api-gateway    │  (JWT, rate limiting)
                        └────────┬─────────┘
     ┌───────────┬──────────┼──────────┬───────────┬─────────────┬──────────────┐
     │           │          │          │           │             │              │
┌────▼─────┐┌────▼─────┐┌───▼────┐┌────▼─────┐┌────▼────┐┌───────▼──────┐┌──────▼───────┐
│generation ││design-tree││ export ││   auth   ││ billing ││ notification ││collaboration │
│ -service  ││ -service  ││-service││ -service ││-service ││   -service   ││  -service    │
└────┬─────┘└────┬─────┘└───┬────┘└──────────┘└─────────┘└──────────────┘└──────┬───────┘
     │            │          │                                                   │
     │     ┌──────▼──────┐   │                                           WebSockets
     │     │ PostgreSQL  │   │                                          (Yjs/CRDT)
     │     │ (JSONB tree)│◄──┼───────────────────────────────────────────────────┘
     │     └─────────────┘   │
     │                       │
┌────▼─────┐          ┌──────────────┐
│Claude/GPT-4│          │ figma-payload │ (polled by)
│ (LLM APIs) │          └──────┬───────┘
└─────────────┘                 │
                        ┌────────▼────────┐
                        │ tools/figma-plugin│ (Plugin API, corre DENTRO de Figma)
                        └───────────────────┘

Redis: caché + colas (BullMQ) · RabbitMQ/SQS: eventos async de generación
S3/Cloud Storage: assets, thumbnails
```

## Flujo principal (generar -> editar -> exportar)

1. **Generar**: `editor-canvas` envía un prompt a `generation-service` (vía
   `api-gateway`) → LLM con structured outputs → validación contra
   `@lilo/design-schema` → reintentos automáticos si falla → `DesignTree`.
2. **Editar**: `editor-canvas` renderiza el árbol con Konva.js. Cada
   interacción (mover, redimensionar, cambiar estilo) actualiza el store
   (Zustand) y se persiste en `design-tree-service` (autosave + versionado).
3. **Colaborar**: múltiples usuarios editan el mismo `DesignTree` a la vez.
   `collaboration-service` sincroniza las operaciones vía Yjs/CRDT sobre
   WebSockets, propaga presencia (cursores, selección) y persiste comentarios
   anclados a elementos.
4. **Exportar**: `export-service` convierte el `DesignDocument` a componentes
   React/Vue + Tailwind (incluyendo flujos multi-pantalla con su navegación),
   a SVG/PNG real de cada pantalla, o a un payload de importación que
   `tools/figma-plugin/` consume para crear los nodos reales en Figma.
   **Nota:** la creación de nodos en Figma no se hace vía su API REST — esa
   API es de solo lectura; solo la Plugin API (que corre dentro de Figma)
   puede crear contenido. Ver `services/export-service/README.md` para el
   detalle de por qué la arquitectura tiene esta forma en dos partes.

## Decisiones de arquitectura

- **Monorepo** con workspaces npm + Turborepo: comparte `design-schema`,
  `sdk-client` y `validation-utils` entre frontend y servicios sin duplicar.
- **PostgreSQL + JSONB** para el árbol de diseño: relacional donde conviene
  (usuarios, equipos, billing) y flexible donde se necesita (árbol de nodos).
- **Microservicios** acotados por responsabilidad única, cada uno con su
  propio `package.json`, desplegable de forma independiente.
- **Colaboración en tiempo real (CRDT/Yjs) es parte del producto final**, no
  una fase condicional a demanda post-lanzamiento: se construye en la Fase 3
  del roadmap, apoyada en un spike técnico dedicado en Fase 0 que valida que
  el esquema de `design-schema` es mergeable con Yjs sin pérdida de datos
  (ver `ROADMAP.md`, Fase 0 "Spike B" y Fase 3).
- **El esquema de diseño (`design-schema`) se diseña completo desde la Fase 0**:
  incluye componentes con variantes, design tokens y soporte multi-pantalla
  desde el primer borrador, precisamente para no tener que rediseñarlo a
  mitad de proyecto cuando se construya colaboración en tiempo real (Fase 3)
  o exportación multi-framework (Fase 4).

## Escalado

- Generación (`generation-service`) es el servicio más sensible a costo y
  latencia: cachear generaciones similares, cola con BullMQ/Redis para
  absorber picos, límites estrictos en el plan free.
- `design-tree-service` es el más sensible a consistencia: autosave +
  snapshots deben ser atómicos y versionados.
- El canvas (`editor-canvas`) debe optimizar renderizado para diseños
  grandes (100+ elementos) **con colaboración activa** — virtualización /
  culling si es necesario (evaluado con datos reales en Fase 7, Beta cerrada).
- `collaboration-service` es el más sensible a conexiones persistentes:
  dimensionar WebSockets y la estrategia de reconexión desde el Spike B de
  Fase 0, antes de que el resto del sistema dependa de su disponibilidad.
