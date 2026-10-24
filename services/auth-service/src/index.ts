import Fastify from "fastify";
import { authRoutes } from "./routes/auth";
import { teamRoutes } from "./routes/teams";

const app = Fastify({ logger: true });
const PORT = Number(process.env.PORT ?? 4004);

app.get("/health", async () => ({ status: "ok", service: "auth-service" }));

app.register(authRoutes);
app.register(teamRoutes);

app.listen({ port: PORT, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
