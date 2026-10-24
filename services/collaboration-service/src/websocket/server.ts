import { WebSocketServer, type WebSocket } from "ws";
import type { Server } from "node:http";
import * as encoding from "lib0/encoding";
import * as awarenessProtocol from "y-protocols/awareness";
import { getOrCreateRoom, closeRoomIfEmpty, persistRoom, listActiveRooms } from "../crdt/room";
import { send, sendSyncStep1, broadcastAwarenessState, handleMessage } from "./syncProtocol";

const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;
const AUTOSAVE_INTERVAL_MS = 10_000;

/**
 * Servidor de WebSockets de colaboración. Una conexión por cliente, agrupada
 * por `designId` (la "sala" — ver crdt/room.ts). El servidor es autoritativo:
 * aplica cada update de cada cliente al Y.Doc de la sala y lo retransmite al
 * resto, y persiste el snapshot periódicamente en design-tree-service.
 *
 * Se monta sobre el servidor HTTP que ya levanta Fastify (`app.server`) en
 * vez de abrir un puerto aparte, para no duplicar configuración de TLS/proxy
 * en despliegue.
 */
export function attachCollaborationWebSocket(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws/designs" });

  wss.on("connection", async (ws: WebSocket, req) => {
    const designId = new URL(req.url ?? "", "http://internal").searchParams.get("designId");
    if (!designId) {
      ws.close(4000, "missing designId");
      return;
    }

    const room = await getOrCreateRoom(designId);
    room.connections.add(ws);

    // Un cliente puede introducir uno o más clientID de Awareness a lo largo
    // de la conexión (normalmente uno, el de su propio Y.Doc local). Se
    // trackean aquí para poder limpiarlos correctamente al desconectar —
    // sin esto, los cursores de clientes desconectados quedarían "fantasma".
    const controlledClientIds = new Set<number>();

    const onDocUpdate = (update: Uint8Array, origin: unknown) => {
      if (origin === ws) return; // no reenviar al cliente que originó el cambio
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_SYNC);
      encoding.writeVarUint8Array(encoder, update);
      const buf = encoding.toUint8Array(encoder);
      room.connections.forEach((conn) => conn !== ws && send(conn, buf));
    };
    room.ydoc.on("update", onDocUpdate);

    const onAwarenessUpdate = (
      { added, updated, removed }: { added: number[]; updated: number[]; removed: number[] },
      origin: unknown
    ) => {
      if (origin === ws) {
        added.concat(updated).forEach((id) => controlledClientIds.add(id));
        removed.forEach((id) => controlledClientIds.delete(id));
      }
      broadcastAwarenessState(room);
    };
    room.awareness.on("update", onAwarenessUpdate);

    ws.on("message", (data: ArrayBuffer) => handleMessage(ws, room, new Uint8Array(data)));

    ws.on("close", () => {
      room.connections.delete(ws);
      room.ydoc.off("update", onDocUpdate);
      room.awareness.off("update", onAwarenessUpdate);
      if (controlledClientIds.size > 0) {
        awarenessProtocol.removeAwarenessStates(room.awareness, Array.from(controlledClientIds), "connection closed");
      }
      closeRoomIfEmpty(designId);
    });

    // Handshake inicial: step 1 de sync + estado de presencia actual de la sala.
    sendSyncStep1(ws, room);
    broadcastAwarenessState(room);
  });

  // Autosave periódico de todas las salas activas — ver ROADMAP.md, Fase 1
  // "autosave" y Fase 3 "hardening de colaboración".
  setInterval(() => {
    for (const room of listActiveRooms()) {
      persistRoom(room);
    }
  }, AUTOSAVE_INTERVAL_MS);

  return wss;
}
