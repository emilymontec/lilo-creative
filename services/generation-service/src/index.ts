import Fastify from "fastify";
import { generationRoutes } from "./routes/generation";

const app = Fastify({ logger: true });
const PORT = Number(process.env.PORT ?? 4001);

app.get("/health", async () => ({ status: "ok", service: "generation-service" }));

app.register(generationRoutes);

app.listen({ port: PORT, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
