import { Queue, Worker, type Job } from "bullmq";
import IORedis from "ioredis";
import { ClaudeAdapter } from "../llm-adapters/claudeAdapter";
import { buildUiGenerationPrompt } from "../prompt-templates/uiGenerationPrompt";
import { generateValidDocument } from "../schema-validator/validateWithRetry";

/**
 * Cola de generación en background — absorbe picos de demanda y permite que
 * `POST /generation` responda rápido con un jobId mientras el LLM procesa
 * (útil para flujos multi-pantalla, que tardan más que una sola pantalla).
 */
const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379");

export const generationQueue = new Queue("generation", { connection });

export function startGenerationWorker() {
  return new Worker(
    "generation",
    async (job: Job<{ prompt: string }>) => {
      const adapter = new ClaudeAdapter();
      const finalPrompt = buildUiGenerationPrompt(job.data.prompt);
      return generateValidDocument(adapter, finalPrompt);
    },
    { connection }
  );
}
