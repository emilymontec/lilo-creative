import type { FastifyInstance } from "fastify";
import { validateDesignDocument, emptyDesignDocument } from "@lilo/design-schema";

/**
 * CRUD del DesignDocument multi-pantalla. El árbol completo se valida contra
 * el esquema antes de persistirse (nunca se confía en que el cliente envíe
 * algo válido, aunque el editor ya valide del lado del cliente).
 */
export async function designRoutes(app: FastifyInstance) {
  app.get("/designs", async (req, reply) => {
    // TODO: listar diseños del equipo/usuario autenticado (ver auth middleware)
    return reply.send([]);
  });

  app.post("/designs", async (req, reply) => {
    const { name } = req.body as { name: string };
    const doc = emptyDesignDocument();
    // TODO: persistir `design` + `doc.screens[0]` vía models/designDocument.ts
    return reply.status(201).send({ id: "TODO", name, document: doc });
  });

  app.get("/designs/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    // TODO: leer design + screens + navigation + components, reconstruir con toDesignDocument()
    return reply.send({ id, document: null });
  });

  app.put("/designs/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const result = validateDesignDocument(req.body);
    if (!result.success) {
      return reply.status(422).send({ error: "invalid_design_document", details: result.error.flatten() });
    }
    // TODO: descomponer con fromDesignDocument() y persistir (autosave)
    return reply.send({ id, saved: true });
  });

  app.get("/designs/:id/versions", async (req, reply) => {
    // TODO: listar design_versions del diseño, más recientes primero
    return reply.send([]);
  });

  app.post("/designs/:id/versions/:versionId/restore", async (req, reply) => {
    // TODO: cargar el snapshot y sobrescribir el estado actual (screens, navigation, components)
    return reply.send({ restored: true });
  });
}
