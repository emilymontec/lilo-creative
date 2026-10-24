import type { FastifyInstance } from "fastify";

/** Gestión de equipos: crear, invitar miembros, cambiar roles. */
export async function teamRoutes(app: FastifyInstance) {
  app.get("/teams", async (req, reply) => {
    // TODO: equipos del usuario autenticado (ver middleware de JWT)
    return reply.send([]);
  });

  app.post("/teams", async (req, reply) => {
    const { name } = req.body as { name: string };
    // TODO: crear equipo con el usuario autenticado como owner/admin
    return reply.status(201).send({ id: "TODO", name });
  });

  app.post("/teams/:id/invite", async (req, reply) => {
    const { email, role } = req.body as { email: string; role: string };
    // TODO: crear TeamMember pendiente + disparar notification-service
    return reply.status(201).send({ invited: email, role });
  });

  app.patch("/teams/:id/members/:userId", async (req, reply) => {
    const { role } = req.body as { role: string };
    // TODO: actualizar TeamRole del miembro (solo admin)
    return reply.send({ updated: true, role });
  });
}
