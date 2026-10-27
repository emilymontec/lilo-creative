/**
 * Cliente de la API REST pública de Figma (`api.figma.com/v1`). Importante:
 * esta API es de **lectura** (archivos, nodos, comentarios, estilos,
 * variables en algunos planes) — NO permite crear ni editar nodos de un
 * archivo. La creación/edición de contenido en un archivo de Figma solo es
 * posible desde la **Plugin API**, que corre dentro de Figma (desktop o
 * web), no desde un servidor externo vía REST.
 *
 * Esto es una corrección respecto a la redacción original de ROADMAP.md
 * ("uso de la API REST de Figma para crear nodos") — ver la nota en la
 * sección de Fase 4 del roadmap y el README de `tools/figma-plugin/` para
 * la arquitectura real: este servicio genera un payload de importación
 * (`figmaPayload.ts`) y un plugin de Figma (`tools/figma-plugin/`) es quien
 * efectivamente crea los nodos, usando la Plugin API, a partir de ese payload.
 *
 * Lo que este cliente SÍ hace con la REST API real:
 * - Verificar que el token de acceso del usuario es válido y a qué archivo apunta.
 * - Publicar un comentario en el archivo de Figma destino (la REST API sí
 *   soporta crear comentarios) notificando que hay una importación lista,
 *   con el link para abrir el plugin.
 */
const FIGMA_API_BASE = "https://api.figma.com/v1";

export interface FigmaFileSummary {
  name: string;
  lastModified: string;
}

export async function verifyFigmaAccess(fileKey: string, accessToken: string): Promise<FigmaFileSummary> {
  const res = await fetch(`${FIGMA_API_BASE}/files/${fileKey}?depth=1`, {
    headers: { "X-Figma-Token": accessToken },
  });
  if (!res.ok) throw new Error(`No se pudo acceder al archivo de Figma (${res.status})`);
  const data = (await res.json()) as { name: string; lastModified: string };
  return { name: data.name, lastModified: data.lastModified };
}

export async function notifyImportReady(fileKey: string, accessToken: string, message: string): Promise<void> {
  await fetch(`${FIGMA_API_BASE}/files/${fileKey}/comments`, {
    method: "POST",
    headers: { "X-Figma-Token": accessToken, "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
}
