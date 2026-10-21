# Lilo Creative

Plataforma de generación de diseños UI/UX editables por IA. A diferencia de las
herramientas que generan solo imágenes o código cerrado, Lilo Creative genera un
**árbol de datos editable** (JSON) que se renderiza sobre un canvas interactivo
tipo Figma, y desde ahí se puede exportar a código (React + Tailwind) o enviar a Figma.

Referencias de producto: **Figma** (motor de edición y modelo de nodos),
**Google Stitch** (generación por IA desde prompts), **Galileo AI / Uizard**
(generación de UI editable), **v0.dev** (generación de código desde diseño),
**Framer** (exportación diseño-a-código en producción).

## Principio de arquitectura

> El árbol JSON del esquema de diseño (`packages/design-schema`) es la **fuente
> de verdad** del sistema. Ninguna funcionalidad nueva debe generar HTML/CSS
> estático como salida final de la IA: todo pasa primero por el árbol.

## Estructura del monorepo

```
lilo-creative/
├── frontend/
│   ├── editor-canvas/      # App React: motor de canvas editable (Konva/Fabric)
│   ├── landing-app/        # Marketing site, waitlist, pricing
│   ├── admin-dashboard/    # Panel interno (moderación, métricas)
│   └── shared-ui/          # Design system compartido (componentes, tokens)
├── services/
│   ├── generation-service/     # prompt -> LLM -> JSON del árbol
│   ├── design-tree-service/    # CRUD del árbol, versionado, autosave
│   ├── export-service/         # JSON -> React/HTML/CSS, JSON -> Figma API
│   ├── auth-service/           # Usuarios, sesiones, permisos, equipos
│   ├── collaboration-service/  # WebSockets + CRDT (Yjs) — fase posterior
│   ├── billing-service/        # Planes, límites de uso, pagos (Stripe)
│   └── notification-service/   # Emails, in-app notifications
├── gateway/
│   └── api-gateway/         # Enrutamiento, rate limiting, auth middleware
├── packages/
│   ├── design-schema/       # Esquema JSON del árbol (fuente de verdad)
│   ├── sdk-client/          # Cliente TS para consumir la API
│   └── validation-utils/
├── infra/
│   ├── docker/
│   ├── k8s/
│   └── terraform/
├── docs/
│   ├── design-schema-spec.md
│   ├── api-reference.md
│   └── ARCHITECTURE.md
├── ROADMAP.md
└── .github/workflows/
```

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React + TypeScript, Konva.js/Fabric.js, Zustand, WebSockets |
| API Gateway | Node.js (Fastify/Express) o Kong, JWT |
| Generation Service | Node.js o Python (FastAPI), Claude/GPT-4 (structured outputs), Redis/BullMQ |
| Design Tree Service | Node.js o Django REST Framework, PostgreSQL (JSONB), versionado tipo Git |
| Export Service | Node.js, generador React/Tailwind, Figma REST API |
| Datos | PostgreSQL, Redis (caché/colas), S3/Cloud Storage (assets) |
| Mensajería | REST (CRUD), RabbitMQ/SQS (eventos async de generación) |
| Infra | Docker, Kubernetes, GitHub Actions, AWS/GCP |

## Primeros pasos

```bash
cp .env.example .env
npm install          # instala todos los workspaces
docker compose up -d # levanta Postgres, Redis, RabbitMQ en local
npm run dev           # arranca los servicios en modo desarrollo
```

Ver `ROADMAP.md` para el plan de fases y `docs/ARCHITECTURE.md` para el detalle
de arquitectura y decisiones técnicas.
