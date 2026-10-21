import { CanvasRenderer } from "./canvas/CanvasRenderer";

export default function App() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* TODO: PromptBar, LayersPanel, PropertiesPanel */}
      <CanvasRenderer />
    </div>
  );
}
