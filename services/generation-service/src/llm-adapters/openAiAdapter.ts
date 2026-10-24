import type { LlmAdapter } from "./types";

/** Adaptador para GPT-4 vía structured outputs (response_format: json_schema). */
export class OpenAiAdapter implements LlmAdapter {
  async generateDesignTree(prompt: string): Promise<unknown> {
    // TODO: llamar a la API de OpenAI con response_format json_schema
    throw new Error("Not implemented");
  }
}
