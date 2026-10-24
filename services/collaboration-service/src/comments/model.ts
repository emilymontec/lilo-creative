/**
 * Comentarios anclados a un elemento del diseño (ver ROADMAP.md, Fase 3,
 * "Semanas 6-7: Comentarios"). Se persisten vía REST normal (no vía CRDT):
 * un comentario es un registro independiente, no una propiedad del árbol de
 * diseño, así que no necesita merge automático — dos comentarios creados a
 * la vez son simplemente dos filas nuevas, sin conflicto posible.
 */
export interface Comment {
  id: string;
  designId: string;
  screenId: string;
  nodeId: string; // elemento del diseño al que está anclado
  authorId: string;
  body: string; // puede incluir menciones "@userId" ya resueltas a texto
  mentionedUserIds: string[];
  resolved: boolean;
  createdAt: string;
  parentCommentId?: string; // hilo de respuestas
}

const MENTION_PATTERN = /@([a-zA-Z0-9_-]+)/g;

export function extractMentions(body: string): string[] {
  return Array.from(body.matchAll(MENTION_PATTERN), (m) => m[1]);
}
