import Fastify from "fastify";
import { commentRoutes } from "./comments/routes";
import { attachCollaborationWebSocket } from "./websocket/server";

const app = Fastify({ logger: true });
const PORT = Number(process.env.PORT ?? 4005);

app.get("/health", async () => ({ status: "ok", service: "collaboration-service" }));

app.register(commentRoutes);

app
  .listen({ port: PORT, host: "0.0.0.0" })
  .then(() => {
    // El servidor de WebSockets (sync CRDT + presencia) se monta sobre el
    // mismo servidor HTTP de Fastify, bajo /ws/designs?designId=<id>.
    attachCollaborationWebSocket(app.server);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
