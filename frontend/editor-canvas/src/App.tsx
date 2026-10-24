import { CanvasRenderer } from "./canvas/CanvasRenderer";
import { ScreensTabs } from "./components/ScreensTabs";
import { Toolbar } from "./components/Toolbar";
import { LayersPanel } from "./components/LayersPanel";
import { ComponentsPanel } from "./components/ComponentsPanel";
import { TokensPanel } from "./components/TokensPanel";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

export default function App() {
  useKeyboardShortcuts();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Toolbar />
      <ScreensTabs />
      <div style={{ display: "flex", flex: 1 }}>
        <LayersPanel />
        {/* TODO: PromptBar */}
        <CanvasRenderer />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <PropertiesPanel />
          <ComponentsPanel />
          <TokensPanel />
        </div>
      </div>
    </div>
  );
}
