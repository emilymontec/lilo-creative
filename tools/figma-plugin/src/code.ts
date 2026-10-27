/// <reference types="@figma/plugin-typings" />

/**
 * Código del "main thread" del plugin — corre dentro del sandbox de Figma
 * con acceso a la Plugin API (`figma.*`). No es un servidor ni un script
 * Node: su única forma de pedir datos externos es `fetch` a un dominio
 * declarado en `manifest.json` (`networkAccess.allowedDomains`).
 *
 * Flujo: el usuario pega un `designId` en la UI (`ui.html`) → este código
 * pide el payload a export-service → recorre los comandos y crea los nodos
 * reales con la Plugin API, agrupados por pantalla en un frame por pantalla.
 */

interface FigmaImportCommand {
  kind: "frame" | "rectangle" | "text";
  name: string;
  x: number; y: number; width: number; height: number;
  fill?: string;
  text?: string;
  fontSize?: number;
  screenName: string;
  parentIndexInScreen: number;
}
interface FigmaImportPayload {
  designId: string;
  designName: string;
  commands: FigmaImportCommand[];
}

figma.showUI(__html__, { width: 320, height: 200 });

figma.ui.onmessage = async (msg: { type: string; designId?: string; apiBaseUrl?: string }) => {
  if (msg.type !== "import" || !msg.designId) return;

  const apiBaseUrl = msg.apiBaseUrl ?? "https://api.lilocreative.app";
  try {
    const res = await fetch(`${apiBaseUrl}/export/${msg.designId}/figma-payload`);
    if (!res.ok) throw new Error(`export-service respondió ${res.status}`);
    const payload = (await res.json()) as FigmaImportPayload;
    await importPayload(payload);
    figma.ui.postMessage({ type: "done", count: payload.commands.length });
  } catch (err) {
    figma.ui.postMessage({ type: "error", message: String(err) });
  }
};

async function importPayload(payload: FigmaImportPayload) {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  // Un frame de Figma por pantalla (parentIndexInScreen agrupa los comandos).
  const screenFrames = new Map<number, FrameNode>();

  for (const cmd of payload.commands) {
    let screenFrame = screenFrames.get(cmd.parentIndexInScreen);

    if (cmd.kind === "frame") {
      screenFrame = figma.createFrame();
      screenFrame.name = cmd.name;
      screenFrame.x = cmd.x + cmd.parentIndexInScreen * 450; // separa pantallas en el canvas de Figma
      screenFrame.y = cmd.y;
      screenFrame.resize(Math.max(cmd.width, 1), Math.max(cmd.height, 1));
      if (cmd.fill) screenFrame.fills = [{ type: "SOLID", color: hexToRgb(cmd.fill) }];
      screenFrames.set(cmd.parentIndexInScreen, screenFrame);
      figma.currentPage.appendChild(screenFrame);
      continue;
    }

    if (!screenFrame) continue; // no debería pasar: el payload siempre abre con un "frame" por pantalla
    // Mismo desplazamiento horizontal que se le dio al frame de esta pantalla,
    // para que sus hijos (con coordenadas absolutas del documento original)
    // queden alineados con el frame ya movido en el canvas de Figma.
    const offsetX = cmd.parentIndexInScreen * 450;

    if (cmd.kind === "rectangle") {
      const rect = figma.createRectangle();
      rect.name = cmd.name;
      rect.x = cmd.x + offsetX;
      rect.y = cmd.y;
      rect.resize(Math.max(cmd.width, 1), Math.max(cmd.height, 1));
      if (cmd.fill) rect.fills = [{ type: "SOLID", color: hexToRgb(cmd.fill) }];
      screenFrame.appendChild(rect);
    } else if (cmd.kind === "text") {
      const text = figma.createText();
      text.name = cmd.name;
      text.x = cmd.x + offsetX;
      text.y = cmd.y;
      text.fontSize = cmd.fontSize ?? 14;
      text.characters = cmd.text ?? "";
      screenFrame.appendChild(text);
    }
  }

  figma.viewport.scrollAndZoomIntoView(Array.from(screenFrames.values()));
}

function hexToRgb(hex: string): RGB {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return { r: r || 0, g: g || 0, b: b || 0 };
}
