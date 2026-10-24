import type { FastifyInstance } from "fastify";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", async (req, reply) => {
    const { email, password } = req.body as { email: string; password: string };
    // TODO: hash de password (bcrypt), crear User + Team personal por defecto
    return reply.status(201).send({ email });
  });

  app.post("/auth/login", async (req, reply) => {
    const { email, password } = req.body as { email: string; password: string };
    // TODO: verificar credenciales, emitir JWT
    return reply.send({ token: "TODO" });
  });

  app.post("/auth/refresh", async (req, reply) => {
    // TODO: validar refresh token, emitir nuevo access token
    return reply.send({ token: "TODO" });
  });
}
