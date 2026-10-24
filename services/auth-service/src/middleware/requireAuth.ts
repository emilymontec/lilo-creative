import type { FastifyRequest, FastifyReply } from "fastify";

/** Verifica el JWT del header Authorization y adjunta el usuario a la request. */
export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "missing_token" });
  }
  // TODO: verificar JWT_SECRET, decodificar y adjuntar req.user
}
