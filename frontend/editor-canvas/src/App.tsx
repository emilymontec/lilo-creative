import { useMemo, useState } from "react";
import { CanvasRenderer } from "./canvas/CanvasRenderer";
import { ScreensTabs } from "./components/ScreensTabs";
import { Toolbar } from "./components/Toolbar";
import { LayersPanel } from "./components/LayersPanel";
import { ComponentsPanel } from "./components/ComponentsPanel";
import { TokensPanel } from "./components/TokensPanel";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { PresenceBar } from "./components/PresenceBar";
import { CommentsPanel } from "./components/CommentsPanel";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useCollaboration } from "./hooks/useCollaboration";

// TODO: en producción, designId y currentUser salen de la ruta/sesión
// autenticada (ver auth-service), no de la URL ni de un color fijo.
function useDemoIdentity() {
  return useMemo(() => {
    const designId = new URLSearchParams(window.location.search).get("designId") ?? "demo-design";
    const currentUserId = `user-${Math.random().toString(36).slice(2, 8)}`;
    const color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
    return { designId, currentUserId, user: { name: currentUserId, color } };
  }, []);
}

export default function App() {
  useKeyboardShortcuts();
  const { designId, currentUserId, user } = useDemoIdentity();
  const { awareness } = useCollaboration(designId, user);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Toolbar />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <ScreensTabs />
        <PresenceBar awareness={awareness} />
      </div>
      <div style={{ display: "flex", flex: 1 }}>
        <LayersPanel />
        {/* TODO: PromptBar */}
        <CanvasRenderer />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <PropertiesPanel />
          <ComponentsPanel />
          <TokensPanel />
          <CommentsPanel designId={designId} currentUserId={currentUserId} />
        </div>
      </div>
    </div>
  );
}
