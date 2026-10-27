import type { FigmaImportPayload } from "./figmaPayload";

/**
 * Almacena el último payload de importación generado por diseño, para que
 * el plugin de Figma lo pueda pedir (`GET /export/:id/figma-payload`)
 * después de que el usuario lo dispare desde el editor (`POST /export/:id/figma`).
 * En memoria del proceso por ahora — mover a Redis si el servicio corre en
 * más de una instancia (mismo motivo que las salas de `collaboration-service`).
 */
const jobs = new Map<string, FigmaImportPayload>();

export function storeImportJob(designId: string, payload: FigmaImportPayload) {
  jobs.set(designId, payload);
}

export function getImportJob(designId: string): FigmaImportPayload | undefined {
  return jobs.get(designId);
}
