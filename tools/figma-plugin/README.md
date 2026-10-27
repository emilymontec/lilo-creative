# @lilo/figma-plugin

> Plugin de Figma que crea los nodos reales de un diseño de Lilo Creative
> dentro de un archivo de Figma. Vive en `tools/`, no en `services/` ni
> `frontend/`, porque no es un servicio web ni una app de navegador: es
> código que corre dentro del sandbox de Figma (desktop o web), cargado
> como plugin, con acceso a la **Plugin API** (`figma.*`).

## Por qué existe esto en vez de una llamada REST directa

Ver `services/export-service/README.md`, sección "Integración con Figma":
la API REST pública de Figma no permite crear ni editar nodos de un
archivo — solo la Plugin API puede, y la Plugin API solo corre dentro de
Figma. Este plugin es la única forma real de que "Enviar a Figma" cree algo
visible en un archivo de Figma.

## Flujo

1. En el editor, el usuario pulsa "Enviar a Figma" → `export-service`
   construye el payload de importación (`figmaPayload.ts`) y lo deja listo.
2. El usuario abre este plugin dentro de Figma (`Plugins → Lilo Creative Import`)
   y pega el `designId`.
3. `src/code.ts` pide `GET /export/:id/figma-payload` y crea un frame por
   pantalla + sus rectángulos/textos con `figma.createFrame()`/`createText()`/etc.

## Desarrollo

```bash
npm install
npm run build   # esbuild → dist/code.js
```

Luego, en Figma desktop: **Plugins → Development → Import plugin from manifest…**
y seleccionar `manifest.json` de esta carpeta.

## Limitaciones de esta primera versión

- `input`, `image`, `icon` y `divider` se importan como rectángulos
  placeholder (ver comentario en `figmaPayload.ts`) — refinarlos a nodos de
  Figma más específicos (ej. un nodo de imagen real para `image`) es un
  siguiente paso, no un bloqueante para tener el flujo completo funcionando.
- No hay sincronización de vuelta (editar en Figma no actualiza el
  `DesignDocument`) — es una exportación unidireccional, como `v0.dev` o
  Framer hacia su destino de export, no una integración bidireccional.
