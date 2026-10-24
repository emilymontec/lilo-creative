import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import type { WebSocket } from "ws";
import { documentToYDoc, yDocToDocument } from "@lilo/collab-schema";
import { emptyDesignDocument, type DesignDocument } from "@lilo/design-schema";

/**
 * Una "sala" de colaboración = un `designId` + su Y.Doc compartido +
 * Awareness (presencia) + las conexiones WebSocket actuales. Las salas
 * viven en memoria del proceso; para más de una instancia del servicio
 * detrás de un load balancer, esto necesita un backend de Awareness/Yjs
 * compartido (ej. Redis pub/sub entre instancias) — ver sección "Escalado"
 * de docs/ARCHITECTURE.md, pendiente de Fase 7 (hardening).
 */
export interface Room {
  designId: string;
  ydoc: Y.Doc;
  awareness: Awareness;
  connections: Set<WebSocket>;
  lastPersistedAt: number;
}

const rooms = new Map<string, Room>();

/** Carga el documento inicial de una sala. TODO: reemplazar por una llamada real a design-tree-service. */
async function loadInitialDocument(designId: string): Promise<DesignDocument> {
  // TODO: GET a design-tree-service (`/designs/:id`) y devolver su DesignDocument real.
  return emptyDesignDocument();
}

export async function getOrCreateRoom(designId: string): Promise<Room> {
  const existing = rooms.get(designId);
  if (existing) return existing;

  const initialDoc = await loadInitialDocument(designId);
  const ydoc = documentToYDoc(initialDoc);
  const room: Room = {
    designId,
    ydoc,
    awareness: new Awareness(ydoc),
    connections: new Set(),
    lastPersistedAt: Date.now(),
  };
  rooms.set(designId, room);
  return room;
}

/** Persiste el snapshot actual de la sala en design-tree-service (autosave colaborativo). */
export async function persistRoom(room: Room) {
  const doc = yDocToDocument(room.ydoc);
  // TODO: PUT a design-tree-service (`/designs/:id`) con `doc`.
  room.lastPersistedAt = Date.now();
}

/** Limpia una sala sin conexiones activas (liberar memoria). Se llama al desconectar el último cliente. */
export function closeRoomIfEmpty(designId: string) {
  const room = rooms.get(designId);
  if (room && room.connections.size === 0) {
    rooms.delete(designId);
  }
}

/** Todas las salas con al menos una conexión activa — usado por el autosave periódico. */
export function listActiveRooms(): Room[] {
  return Array.from(rooms.values()).filter((r) => r.connections.size > 0);
}
