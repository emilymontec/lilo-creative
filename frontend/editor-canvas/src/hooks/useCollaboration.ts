import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import type { Awareness } from "y-protocols/awareness";
import { yDocToDocument, replaceScreenRoot } from "@lilo/collab-schema";
import { useDesignStore } from "../store/designStore";

export interface CollaboratorInfo {
  name: string;
  color: string;
}

/**
 * Conecta el editor a la sala de colaboración de `designId` en
 * collaboration-service (ver ROADMAP.md, Fase 3). Hidrata el store local
 * con el estado del Y.Doc compartido al conectar y en cada update remoto, y
 * empuja los cambios locales de vuelta al Y.Doc.
 *
 * Límite conocido de esta primera versión (ver también README de
 * `@lilo/collab-schema` y de `collaboration-service`): el Y.Doc del
 * servidor es granular por nodo, pero este hook empuja el `root` completo
 * de la pantalla activa en cada cambio local (`replaceScreenRoot`) en vez
 * de parchear solo el nodo tocado — así que el merge real hoy es por
 * pantalla, no por nodo individual. Dos usuarios editando pantallas
 * distintas nunca chocan; dos usuarios editando la misma pantalla a la vez
 * sí pueden pisarse el `root` completo de esa pantalla (última escritura
 * gana). Cerrar esa brecha implica que las mutaciones de `designStore`
 * escriban directamente sobre el Y.Doc (vía `syncNodeIntoYMap`) en vez de
 * sobre un árbol JS plano que luego se empuja entero.
 */
export function useCollaboration(
  designId: string | null,
  user: CollaboratorInfo,
  wsUrl = "ws://localhost:4005/ws/designs"
) {
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const applyingRemoteRef = useRef(false);
  const [awareness, setAwareness] = useState<Awareness | null>(null);

  useEffect(() => {
    if (!designId) return;

    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(wsUrl, designId, ydoc, { params: { designId } });
    ydocRef.current = ydoc;
    providerRef.current = provider;
    setAwareness(provider.awareness);

    provider.awareness.setLocalStateField("user", user);

    function applyRemoteState() {
      applyingRemoteRef.current = true;
      const doc = yDocToDocument(ydoc);
      if (doc.screens.length > 0) useDesignStore.getState().setDocument(doc, false);
      applyingRemoteRef.current = false;
    }

    provider.on("sync", (isSynced: boolean) => {
      if (isSynced) applyRemoteState();
    });
    ydoc.on("update", (_update: Uint8Array, origin: unknown) => {
      if (origin !== "local-push") applyRemoteState();
    });

    return () => {
      provider.destroy();
      ydoc.destroy();
      ydocRef.current = null;
      providerRef.current = null;
      setAwareness(null);
    };
  }, [designId, wsUrl]);

  useEffect(() => {
    if (!designId) return;
    const unsubscribe = useDesignStore.subscribe((state, prevState) => {
      if (applyingRemoteRef.current) return;
      const ydoc = ydocRef.current;
      if (!ydoc || !state.document || state.document === prevState.document) return;
      const screen = state.document.screens.find((s) => s.id === state.currentScreenId);
      if (!screen) return;
      Y.transact(ydoc, () => replaceScreenRoot(ydoc, screen.id, screen.root), "local-push");
    });
    return unsubscribe;
  }, [designId]);

  return { awareness };
}
