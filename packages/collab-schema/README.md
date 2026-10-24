# @lilo/collab-schema

> Puente entre `DesignDocument` (`@lilo/design-schema`) y un `Y.Doc` de Yjs.
> Lo usan tanto `collaboration-service` (servidor, autoritativo) como
> `editor-canvas` (cliente) para no duplicar la lógica de conversión — ver
> ROADMAP.md, Fase 3.

## Por qué un paquete aparte

El servidor de colaboración y el editor necesitan construir exactamente el
mismo árbol de tipos Yjs (`Y.Map`/`Y.Array`) a partir de un `DesignDocument`,
o sus cambios no van a mergear correctamente. Si cada lado implementara su
propia conversión, un desajuste entre servidor y cliente produciría
corrupción silenciosa del documento compartido — de ahí que viva en
`packages/`, igual que `design-schema`.

## Uso

```ts
import { documentToYDoc, yDocToDocument, replaceScreenRoot } from "@lilo/collab-schema";

const ydoc = documentToYDoc(initialDocument); // al crear una sala
// ... ydoc se sincroniza por WebSocket con otros clientes ...
const current = yDocToDocument(ydoc); // snapshot actual para persistir o hidratar un cliente nuevo
replaceScreenRoot(ydoc, screenId, newRoot); // edición granular de una pantalla
```

Ver el comentario en `src/index.ts` para el límite conocido de esta primera
versión (merge por nodo completo, no por campo) y cómo evolucionarlo.
