import Fastify from "fastify";
import { exportRoutes } from "./routes/export";

const app = Fastify({ logger: true });
const PORT = Number(process.env.PORT ?? 4003);

app.get("/health", async () => ({ status: "ok", service: "export-service" }));

app.register(exportRoutes);

app.listen({ port: PORT, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
