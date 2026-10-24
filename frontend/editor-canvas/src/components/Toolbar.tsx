import { useDesignStore } from "../store/designStore";
import { useHistoryStore } from "../store/historyStore";

export function Toolbar() {
  const undo = useDesignStore((s) => s.undo);
  const redo = useDesignStore((s) => s.redo);
  // useHistoryStore se suscribe aparte para que los botones se habiliten/deshabiliten
  // reactivamente sin acoplar designStore a los detalles internos del historial.
  const canUndo = useHistoryStore((s) => s.past.length > 0);
  const canRedo = useHistoryStore((s) => s.future.length > 0);

  return (
    <div role="toolbar">
      <button onClick={undo} disabled={!canUndo}>↶ Deshacer</button>
      <button onClick={redo} disabled={!canRedo}>↷ Rehacer</button>
    </div>
  );
}
