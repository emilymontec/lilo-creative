import type { DesignDocument, DesignNode, Screen } from "@lilo/design-schema";
import { resolveInstance, resolveFill } from "@lilo/design-schema";

/**
 * Payload de importación para el plugin de Figma (ver README de este
 * módulo y `tools/figma-plugin/` para el porqué de esta arquitectura en
 * dos partes). Es una lista plana de "comandos de creación" con posiciones
 * absolutas ya resueltas (coordenadas acumuladas respecto a cada pantalla),
 * pensada para que el código del plugin (que corre dentro de Figma, con la
 * Plugin API) solo tenga que recorrer un array y llamar a
 * `figma.createFrame()`/`createText()`/etc. sin tener que entender
 * componentes, variantes ni tokens — toda esa resolución ya pasó por acá.
 */
export interface FigmaImportCommand {
  kind: "frame" | "rectangle" | "text";
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string; // hex, ya resuelto desde tokens
  text?: string;
  fontSize?: number;
  screenName: string;
  parentIndexInScreen: number; // orden de pantalla, para agrupar los frames resultantes
}

export interface FigmaImportPayload {
  designId: string;
  designName: string;
  commands: FigmaImportCommand[];
}

export function buildFigmaImportPayload(designId: string, designName: string, doc: DesignDocument): FigmaImportPayload {
  const commands: FigmaImportCommand[] = [];
  const screensSorted = [...doc.screens].sort((a, b) => a.order - b.order);

  screensSorted.forEach((screen, screenIndex) => {
    collectCommands(screen.root, doc, 0, 0, screen.name, screenIndex, commands, true);
  });

  return { designId, designName, commands };
}

function collectCommands(
  rawNode: DesignNode,
  doc: DesignDocument,
  parentX: number,
  parentY: number,
  screenName: string,
  screenIndex: number,
  out: FigmaImportCommand[],
  isScreenRoot: boolean
) {
  const node = resolveInstance(rawNode, doc);
  if (node.hidden) return;

  const x = parentX + (node.style?.x ?? 0);
  const y = parentY + (node.style?.y ?? 0);
  const width = node.style?.width ?? 100;
  const height = node.style?.height ?? 40;
  const fill = resolveFill(node.style, doc);

  if (node.type === "frame" || node.type === "stack") {
    out.push({
      kind: isScreenRoot ? "frame" : "rectangle",
      name: node.name ?? (isScreenRoot ? screenName : node.type),
      x, y, width, height, fill,
      screenName, parentIndexInScreen: screenIndex,
    });
    (node.children ?? []).forEach((c) => collectCommands(c, doc, x, y, screenName, screenIndex, out, false));
    return;
  }

  if (node.type === "text" || node.type === "button") {
    if (node.type === "button") {
      out.push({ kind: "rectangle", name: node.name ?? "button", x, y, width, height, fill: fill ?? "#6E56CF", screenName, parentIndexInScreen: screenIndex });
    }
    out.push({ kind: "text", name: node.name ?? "text", x, y, width, height, text: node.text ?? "", fontSize: 14, screenName, parentIndexInScreen: screenIndex });
    return;
  }

  // input/image/icon/divider: representados como rectángulo placeholder — el
  // plugin puede refinarlos (ej. a un nodo de imagen real) en una iteración futura.
  out.push({ kind: "rectangle", name: node.name ?? node.type, x, y, width, height, fill: fill ?? "#E5E5E5", screenName, parentIndexInScreen: screenIndex });
}
