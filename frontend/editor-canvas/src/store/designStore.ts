import { create } from "zustand";
import type { DesignTree, DesignNode } from "@lilo/design-schema";

/**
 * Single source of truth del editor: el árbol de diseño actual.
 * Cada interacción en el canvas (mover, redimensionar, editar texto)
 * debe pasar por estas acciones para mantener canvas <-> JSON sincronizados.
 */
interface DesignStoreState {
  tree: DesignTree | null;
  selectedNodeId: string | null;
  setTree: (tree: DesignTree) => void;
  selectNode: (id: string | null) => void;
  updateNode: (id: string, patch: Partial<DesignNode>) => void;
}

export const useDesignStore = create<DesignStoreState>((set) => ({
  tree: null,
  selectedNodeId: null,
  setTree: (tree) => set({ tree }),
  selectNode: (id) => set({ selectedNodeId: id }),
  updateNode: (id, patch) =>
    set((state) => {
      if (!state.tree) return state;
      // TODO: recorrer el árbol y aplicar el patch al nodo con ese id (inmutable)
      return state;
    }),
}));
