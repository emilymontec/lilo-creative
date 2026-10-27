# @lilo/export-service

> Convierte el `DesignDocument` a código (React o Vue + Tailwind, con routing
> multi-pantalla ya resuelto), a assets (SVG/PNG, thumbnails), y prepara la
> importación a Figma. Ver ROADMAP.md, Fase 4.

Puerto por defecto: `4003`

## Endpoints

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/export/:id/code?framework=react\|vue` | Proyecto completo (archivos como JSON; empaquetado a `.zip` queda como `TODO`) |
| GET | `/export/:id/image?screenId=&format=svg\|png` | SVG real o PNG rasterizado de una pantalla |
| GET | `/export/:id/thumbnail` | PNG 200px de la primera pantalla, para "Mis diseños" |
| POST | `/export/:id/figma` | Prepara el payload de importación y (opcionalmente) comenta en el archivo de Figma que está listo |
| GET | `/export/:id/figma-payload` | El plugin de Figma lo consulta para obtener el payload a importar |

## Submódulos

- `src/generators/styleToTailwind.ts` — `BaseStyle` → clases Tailwind (valores arbitrarios, no la escala por defecto)
- `src/generators/reactGenerator.ts` / `vueGenerator.ts` — `DesignDocument` → proyecto completo, un componente por pantalla + router generado desde `navigation`
- `src/generators/svgGenerator.ts` — `DesignDocument` → SVG real de una pantalla (mismo recorrido del árbol que el canvas, no una captura)
- `src/generators/rasterize.ts` — SVG → PNG (`sharp`), para descargas PNG y thumbnails
- `src/figma-integration/` — ver nota abajo

## Integración con Figma: por qué no es "solo REST"

La API REST pública de Figma (`api.figma.com/v1`) es de **lectura**: no
permite crear ni editar nodos de un archivo. Crear contenido en un archivo
de Figma únicamente es posible desde la **Plugin API**, que corre dentro de
Figma (desktop o web) — nunca desde un servidor externo. Esto corrige la
redacción original de `ROADMAP.md` Fase 4 ("API REST de Figma para crear
nodos"), que asumía una capacidad que esa API no tiene.

La arquitectura real, en dos partes:

1. **Este servicio** (`figma-integration/figmaPayload.ts`) resuelve todo el
   `DesignDocument` (componentes, variantes, tokens) a una lista plana de
   comandos de creación con posiciones absolutas — y opcionalmente usa la
   parte de la REST API de Figma que sí existe (`figmaRestClient.ts`:
   verificar acceso a un archivo, publicar un comentario) para avisar que
   hay una importación lista.
2. **`tools/figma-plugin/`** (nuevo, fuera de `services/` porque no es un
   servicio web sino un plugin que corre dentro de Figma) pide ese payload
   (`GET /export/:id/figma-payload`) y crea los nodos reales con
   `figma.createFrame()`/`createText()`/etc. vía la Plugin API.

## Desarrollo

```bash
npm install
npm run dev
```
