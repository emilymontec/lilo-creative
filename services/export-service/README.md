# @lilo/export-service

> Convierte el árbol JSON a código (React + Tailwind) y lo sincroniza con Figma vía su API REST.

Puerto por defecto: `4003`

## Desarrollo

```bash
npm install
npm run dev
```

## Submódulos

- `src/generators/` — JSON -> componentes React + Tailwind (código limpio, no HTML inline)
- `src/figma-integration/` — creación de nodos en Figma vía API REST ("Enviar a Figma")
- `src/routes/` — endpoints de exportación (`/export/code`, `/export/figma`, `/export/image`)

## Notas

- La exportación a imagen (PNG/SVG) se resuelve en el propio canvas del frontend
  o renderizando el árbol server-side con un headless renderer.

