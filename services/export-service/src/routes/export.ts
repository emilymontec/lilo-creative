import type { FastifyInstance } from "fastify";
import type { DesignDocument } from "@lilo/design-schema";
import { generateReactProject } from "../generators/reactGenerator";
import { generateVueProject } from "../generators/vueGenerator";
import { generateScreenSvg } from "../generators/svgGenerator";
import { svgToPng, generateThumbnail } from "../generators/rasterize";
import { buildFigmaImportPayload } from "../figma-integration/figmaPayload";
import { storeImportJob, getImportJob } from "../figma-integration/importJobs";
import { notifyImportReady } from "../figma-integration/figmaRestClient";

/** TODO: reemplazar por una llamada real a design-tree-service (`GET /designs/:id`). */
async function loadDesignDocument(designId: string): Promise<DesignDocument> {
  throw new Error("TODO: GET a design-tree-service");
}

export async function exportRoutes(app: FastifyInstance) {
  // JSON → React + Tailwind | Vue + Tailwind, con routing multi-pantalla resuelto.
  app.get("/export/:id/code", async (req, reply) => {
    const { id } = req.params as { id: string };
    const { framework = "react" } = req.query as { framework?: "react" | "vue" };
    const doc = await loadDesignDocument(id);
    const files = framework === "vue" ? generateVueProject(doc) : generateReactProject(doc);
    // TODO: empaquetar `files` como .zip (ej. con `archiver`) y devolver el binario
    // en vez de JSON, para una descarga directa desde el editor.
    return reply.send({ framework, files });
  });

  // SVG real (no captura de pantalla) de una pantalla específica.
  app.get("/export/:id/image", async (req, reply) => {
    const { id } = req.params as { id: string };
    const { screenId, format = "svg" } = req.query as { screenId?: string; format?: "svg" | "png" };
    const doc = await loadDesignDocument(id);
    const screen = screenId ? doc.screens.find((s) => s.id === screenId) : doc.screens[0];
    if (!screen) return reply.status(404).send({ error: "screen_not_found" });

    const svg = generateScreenSvg(screen, doc);
    if (format === "png") {
      const png = await svgToPng(svg);
      return reply.type("image/png").send(png);
    }
    return reply.type("image/svg+xml").send(svg);
  });

  // Thumbnail (200px) para la pantalla de "Mis diseños".
  app.get("/export/:id/thumbnail", async (req, reply) => {
    const { id } = req.params as { id: string };
    const doc = await loadDesignDocument(id);
    const screen = doc.screens[0];
    if (!screen) return reply.status(404).send({ error: "no_screens" });
    const svg = generateScreenSvg(screen, doc);
    const png = await generateThumbnail(svg);
    return reply.type("image/png").send(png);
  });

  // Prepara el payload de importación y notifica en Figma que está listo —
  // la creación real de nodos la hace tools/figma-plugin/ con la Plugin API,
  // no este endpoint (ver figmaRestClient.ts para el porqué).
  app.post("/export/:id/figma", async (req, reply) => {
    const { id } = req.params as { id: string };
    const { figmaFileKey, figmaAccessToken } = req.body as { figmaFileKey?: string; figmaAccessToken?: string };
    const doc = await loadDesignDocument(id);
    const payload = buildFigmaImportPayload(id, `design-${id}`, doc);
    storeImportJob(id, payload);

    if (figmaFileKey && figmaAccessToken) {
      await notifyImportReady(figmaFileKey, figmaAccessToken, `Un diseño de Lilo Creative está listo para importar (designId: ${id}). Abrí el plugin "Lilo Creative Import" en este archivo.`);
    }

    return reply.status(202).send({ designId: id, commandCount: payload.commands.length, status: "ready_for_plugin" });
  });

  // El plugin de Figma pide el payload acá (polling simple, ver tools/figma-plugin/).
  app.get("/export/:id/figma-payload", async (req, reply) => {
    const { id } = req.params as { id: string };
    const payload = getImportJob(id);
    if (!payload) return reply.status(404).send({ error: "no_pending_import" });
    return reply.send(payload);
  });
}
