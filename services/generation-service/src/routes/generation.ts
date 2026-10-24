import type { FastifyInstance } from "fastify";
import { ClaudeAdapter } from "../llm-adapters/claudeAdapter";
import { buildUiGenerationPrompt } from "../prompt-templates/uiGenerationPrompt";
import { generateValidDocument } from "../schema-validator/validateWithRetry";

export async function generationRoutes(app: FastifyInstance) {
  app.post("/generation", async (req, reply) => {
    const { prompt } = req.body as { prompt: string };
    const adapter = new ClaudeAdapter();
    const finalPrompt = buildUiGenerationPrompt(prompt);
    const document = await generateValidDocument(adapter, finalPrompt);
    return reply.send(document);
  });
}
