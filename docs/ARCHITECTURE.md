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
          ┌───────────┬──────────┼──────────┬───────────┬─────────────┐
          │           │          │          │           │             │
   ┌──────▼─────┐┌────▼─────┐┌───▼────┐┌────▼─────┐┌────▼────┐┌───────▼──────┐
   │ generation ││design-tree││ export ││   auth   ││ billing ││ notification │
   │  -service  ││ -service  ││-service││ -service ││-service ││   -service   │
   └──────┬─────┘└────┬─────┘└───┬────┘└──────────┘└─────────┘└──────────────┘
          │            │          │
          │     ┌──────▼──────┐   │
          │     │ PostgreSQL  │   │
          │     │ (JSONB tree)│   │
          │     └─────────────┘   │
          │                       │
   ┌──────▼─────┐          ┌──────▼──────┐
   │ Claude/GPT-4│          │  Figma API  │
   │  (LLM APIs) │          └─────────────┘
   └─────────────┘

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
3. **Exportar**: `export-service` convierte el `DesignTree` a componentes
   React + Tailwind, o lo envía a Figma vía su API REST.

## Decisiones de arquitectura

- **Monorepo** con workspaces npm + Turborepo: comparte `design-schema`,
  `sdk-client` y `validation-utils` entre frontend y servicios sin duplicar.
- **PostgreSQL + JSONB** para el árbol de diseño: relacional donde conviene
  (usuarios, equipos, billing) y flexible donde se necesita (árbol de nodos).
- **Microservicios** acotados por responsabilidad única, cada uno con su
  propio `package.json`, desplegable de forma independiente.
- **Colaboración en tiempo real (CRDT/Yjs) es post-MVP**: se deja fuera de
  las Fases 1-3 y se evalúa tras el lanzamiento según demanda real de
  usuarios beta (ver `ROADMAP.md`, Fase 3 y riesgo de alcance en sección 10).

## Escalado

- Generación (`generation-service`) es el servicio más sensible a costo y
  latencia: cachear generaciones similares, cola con BullMQ/Redis para
  absorber picos, límites estrictos en el plan free.
- `design-tree-service` es el más sensible a consistencia: autosave +
  snapshots deben ser atómicos y versionados.
- El canvas (`editor-canvas`) debe optimizar renderizado para diseños
  grandes (100+ elementos) — virtualización / culling si es necesario
  (evaluado con datos reales en Fase 4, Beta).
