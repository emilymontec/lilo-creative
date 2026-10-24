import { useEffect } from "react";
import { useDesignStore } from "../store/designStore";

/**
 * Atajos de teclado del editor (ver ROADMAP.md, Fase 2 "Semanas 8-10:
 * Historial y atajos"): deshacer/rehacer, duplicar, eliminar y mover con
 * flechas (con Shift para pasos de 10px).
 */
export function useKeyboardShortcuts() {
  const selectedNodeId = useDesignStore((s) => s.selectedNodeId);
  const undo = useDesignStore((s) => s.undo);
  const redo = useDesignStore((s) => s.redo);
  const duplicateNode = useDesignStore((s) => s.duplicateNode);
  const removeNode = useDesignStore((s) => s.removeNode);
  const nudgeNode = useDesignStore((s) => s.nudgeNode);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isMeta = e.metaKey || e.ctrlKey;

      if (isMeta && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if (isMeta && ((e.key.toLowerCase() === "z" && e.shiftKey) || e.key.toLowerCase() === "y")) {
        e.preventDefault();
        redo();
        return;
      }

      if (!selectedNodeId) return;

      if (isMeta && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateNode(selectedNodeId);
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        removeNode(selectedNodeId);
        return;
      }

      const step = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowUp") { e.preventDefault(); nudgeNode(selectedNodeId, 0, -step); }
      if (e.key === "ArrowDown") { e.preventDefault(); nudgeNode(selectedNodeId, 0, step); }
      if (e.key === "ArrowLeft") { e.preventDefault(); nudgeNode(selectedNodeId, -step, 0); }
      if (e.key === "ArrowRight") { e.preventDefault(); nudgeNode(selectedNodeId, step, 0); }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedNodeId, undo, redo, duplicateNode, removeNode, nudgeNode]);
}
