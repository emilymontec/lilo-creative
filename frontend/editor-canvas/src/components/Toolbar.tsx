import { useDesignStore } from "../store/designStore";
import { useHistoryStore } from "../store/historyStore";

export function Toolbar() {
  const undo = useDesignStore((s) => s.undo);
  const redo = useDesignStore((s) => s.redo);
  const canUndo = useHistoryStore((s) => s.past.length > 0);
  const canRedo = useHistoryStore((s) => s.future.length > 0);

  const selectedNodeIds = useDesignStore((s) => s.selectedNodeIds);
  const groupNodes = useDesignStore((s) => s.groupNodes);
  const previewMode = useDesignStore((s) => s.previewMode);
  const togglePreviewMode = useDesignStore((s) => s.togglePreviewMode);

  return (
    <div role="toolbar">
      <button onClick={undo} disabled={!canUndo}>↶ Deshacer</button>
      <button onClick={redo} disabled={!canRedo}>↷ Rehacer</button>
      {selectedNodeIds.length >= 2 && (
        <button onClick={() => groupNodes(selectedNodeIds)}>Agrupar ({selectedNodeIds.length})</button>
      )}
      <button onClick={togglePreviewMode} aria-pressed={previewMode}>
        {previewMode ? "◀ Salir de preview" : "▶ Preview (navegación real)"}
      </button>
    </div>
  );
}
