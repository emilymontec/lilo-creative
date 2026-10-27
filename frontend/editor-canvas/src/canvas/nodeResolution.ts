/**
 * Re-exporta la resolución de instancias/tokens desde @lilo/design-schema.
 * Vive ahí (no aquí) para que `export-service` (Fase 4) resuelva componentes
 * y tokens exactamente igual que el editor — una sola fuente de verdad para
 * "qué renderiza realmente un nodo", no una copia del lado del cliente.
 */
export { resolveInstance, resolveColor, resolveFill } from "@lilo/design-schema";
