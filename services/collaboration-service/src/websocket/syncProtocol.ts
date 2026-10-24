/**
 * Implementación del protocolo de cable estándar de y-websocket (compatible
 * con el cliente `WebsocketProvider` de la librería `y-websocket`), para no
 * depender de los scripts de ejemplo de esa librería en el servidor.
 * Dos tipos de mensaje: 0 = sync (y-protocols/sync), 1 = awareness
 * (y-protocols/awareness). Referencia: documentación de Yjs sobre proveedores.
 */
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import type { WebSocket } from "ws";
import type { Room } from "../crdt/room";

const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;

export function send(ws: WebSocket, buf: Uint8Array) {
  if (ws.readyState === ws.OPEN) ws.send(buf, (err) => err && ws.close());
}

export function sendSyncStep1(ws: WebSocket, room: Room) {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, MESSAGE_SYNC);
  syncProtocol.writeSyncStep1(encoder, room.ydoc);
  send(ws, encoding.toUint8Array(encoder));
}

export function broadcastAwarenessState(room: Room) {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
  encoding.writeVarUint8Array(
    encoder,
    awarenessProtocol.encodeAwarenessUpdate(room.awareness, Array.from(room.awareness.getStates().keys()))
  );
  const buf = encoding.toUint8Array(encoder);
  room.connections.forEach((conn) => send(conn, buf));
}

/** Procesa un mensaje entrante de un cliente de la sala y propaga el update a los demás. */
export function handleMessage(ws: WebSocket, room: Room, data: Uint8Array) {
  const decoder = decoding.createDecoder(data);
  const messageType = decoding.readVarUint(decoder);

  if (messageType === MESSAGE_SYNC) {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MESSAGE_SYNC);
    // syncProtocol.readSyncMessage aplica el update al Y.Doc y, si corresponde
    // (sync step 1 de otro cliente), escribe la respuesta en `encoder`.
    syncProtocol.readSyncMessage(decoder, encoder, room.ydoc, ws);
    if (encoding.length(encoder) > 1) send(ws, encoding.toUint8Array(encoder));
    // El resto de clientes de la sala reciben el update vía el listener
    // "update" del Y.Doc (ver websocket/server.ts), no desde aquí.
  } else if (messageType === MESSAGE_AWARENESS) {
    awarenessProtocol.applyAwarenessUpdate(room.awareness, decoding.readVarUint8Array(decoder), ws);
  }
}
