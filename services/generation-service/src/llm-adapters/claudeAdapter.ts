import type { LlmAdapter } from "./types";

/**
 * Adaptador para Claude vía structured outputs / tool use forzado,
 * para maximizar la tasa de JSON válido sin reintentos.
 */
export class ClaudeAdapter implements LlmAdapter {
  async generateDesignTree(prompt: string): Promise<unknown> {
    // TODO: llamar a la API de Claude con tool use forzando el esquema DesignDocument
    throw new Error("Not implemented");
  }
}
