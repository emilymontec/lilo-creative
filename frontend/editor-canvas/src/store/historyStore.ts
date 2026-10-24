import { create } from "zustand";
import type { DesignDocument } from "@lilo/design-schema";

/**
 * Historial de undo/redo basado en snapshots del DesignDocument completo
 * (no del DOM) — ver ROADMAP.md, Fase 2: "Undo/redo robusto (basado en el
 * historial del árbol JSON ... compatible con operaciones CRDT de la Fase 3)".
 * Guardar snapshots completos es la implementación simple de partida; antes
 * de Fase 3 esto se puede migrar a un log de operaciones (deltas) para que
 * cada entrada del historial sea una operación CRDT aplicable/revertible.
 */
const MAX_HISTORY = 50;

interface HistoryState {
  past: DesignDocument[];
  future: DesignDocument[];
  record: (previousDocument: DesignDocument) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  undo: (current: DesignDocument) => DesignDocument | null;
  redo: (current: DesignDocument) => DesignDocument | null;
  clear: () => void;
}

function clone(doc: DesignDocument): DesignDocument {
  return JSON.parse(JSON.stringify(doc));
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],

  record: (previousDocument) =>
    set((state) => ({
      past: [...state.past, clone(previousDocument)].slice(-MAX_HISTORY),
      future: [], // cualquier mutación nueva invalida el "redo" pendiente
    })),

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  undo: (current) => {
    const { past, future } = get();
    if (past.length === 0) return null;
    const previous = past[past.length - 1];
    set({ past: past.slice(0, -1), future: [clone(current), ...future].slice(0, MAX_HISTORY) });
    return previous;
  },

  redo: (current) => {
    const { past, future } = get();
    if (future.length === 0) return null;
    const next = future[0];
    set({ past: [...past, clone(current)].slice(-MAX_HISTORY), future: future.slice(1) });
    return next;
  },

  clear: () => set({ past: [], future: [] }),
}));
