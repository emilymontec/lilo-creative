import Fastify from "fastify";

const app = Fastify({ logger: true });
const PORT = Number(process.env.PORT ?? 4000);

app.get("/health", async () => ({ status: "ok", service: "api-gateway" }));

// TODO: registrar rutas de src/routes aquí

app.listen({ port: PORT, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
