import Fastify from "fastify";
import { designRoutes } from "./routes/designs";

const app = Fastify({ logger: true });
const PORT = Number(process.env.PORT ?? 4002);

app.get("/health", async () => ({ status: "ok", service: "design-tree-service" }));

app.register(designRoutes);

app.listen({ port: PORT, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
