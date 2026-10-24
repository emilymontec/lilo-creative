import type { FastifyInstance } from "fastify";
import { extractMentions, type Comment } from "./model";

/**
 * Endpoints de comentarios. `POST /designs/:id/comments` dispara
 * `notification-service` para cada usuario mencionado (ver ROADMAP.md,
 * Fase 3: "menciones y notificaciones básicas").
 */
export async function commentRoutes(app: FastifyInstance) {
  app.get("/designs/:id/comments", async (req, reply) => {
    const { id } = req.params as { id: string };
    // TODO: listar comentarios del diseño (todas las pantallas o filtrado por screenId vía query)
    return reply.send([] as Comment[]);
  });

  app.post("/designs/:id/comments", async (req, reply) => {
    const { id } = req.params as { id: string };
    const { screenId, nodeId, authorId, body, parentCommentId } = req.body as Partial<Comment>;
    if (!screenId || !nodeId || !authorId || !body) {
      return reply.status(400).send({ error: "missing_fields" });
    }
    const mentionedUserIds = extractMentions(body);
    // TODO: persistir el comentario y, por cada mentionedUserId, llamar a
    // notification-service (`POST /notifications/send`) con el tipo "mention".
    const comment: Comment = {
      id: "TODO",
      designId: id,
      screenId,
      nodeId,
      authorId,
      body,
      mentionedUserIds,
      resolved: false,
      createdAt: new Date().toISOString(),
      parentCommentId,
    };
    return reply.status(201).send(comment);
  });

  app.patch("/designs/:id/comments/:commentId/resolve", async (req, reply) => {
    // TODO: marcar el hilo como resuelto
    return reply.send({ resolved: true });
  });
}
