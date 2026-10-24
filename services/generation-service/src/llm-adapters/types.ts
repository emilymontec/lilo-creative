export interface LlmAdapter {
  generateDesignTree(prompt: string): Promise<unknown>; // JSON crudo, aún sin validar (se valida como DesignDocument)
}
