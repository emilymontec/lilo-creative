import { validateDesignDocument } from "@lilo/design-schema";
import type { LlmAdapter } from "../llm-adapters/types";

/**
 * Valida la salida del LLM contra el DesignDocument completo (multi-pantalla)
 * y reintenta automáticamente hasta `maxRetries` veces si el JSON no es
 * válido (gate de decisión del spike técnico: ~90%+ de JSON válido con
 * reintentos — ver ROADMAP.md, Fase 0, Spike A).
 */
export async function generateValidDocument(
  adapter: LlmAdapter,
  prompt: string,
  maxRetries = 2
) {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const raw = await adapter.generateDesignTree(prompt);
    const result = validateDesignDocument(raw);
    if (result.success) return result.data;
    lastError = result.error;
  }
  throw new Error(`No se pudo generar un DesignDocument válido tras ${maxRetries + 1} intentos: ${String(lastError)}`);
}
