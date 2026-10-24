import { create } from "zustand";
import type {
  DesignDocument,
  DesignNode,
  Screen,
  ComponentDefinition,
  ComponentVariant,
  ColorToken,
  TypographyToken,
  SpacingToken,
} from "@lilo/design-schema";
import { useHistoryStore } from "./historyStore";
import * as tree from "./treeUtils";

/**
 * Single source of verdad del editor: el DesignDocument completo (todas las
 * pantallas, navegación, componentes y tokens del proyecto). Toda mutación
 * pasa por `mutateScreen`/`mutateDocument`, que registran el estado anterior
 * en `historyStore` antes de aplicar el cambio — así todas las acciones de
 * este store quedan cubiertas por undo/redo sin tener que recordarlo en cada
 * una (ver ROADMAP.md, Fase 2).
 */
interface DesignStoreState {
  document: DesignDocument | null;
  currentScreenId: string | null;
  selectedNodeId: string | null;
  /** ids en la selección múltiple actual (incluye siempre a `selectedNodeId` cuando hay uno). */
  selectedNodeIds: string[];
  /** Modo preview: los clics en botones con `onPress` navegan entre pantallas en vez de seleccionar. */
  previewMode: boolean;

  setDocument: (document: DesignDocument, resetHistory?: boolean) => void;
  goToScreen: (screenId: string) => void;
  selectNode: (id: string | null) => void;
  toggleSelectNode: (id: string, additive: boolean) => void;
  clearSelection: () => void;
  togglePreviewMode: () => void;
  currentScreen: () => Screen | null;

  // --- edición de nodos (Fase 1-2) ---
  updateNode: (nodeId: string, patch: Partial<DesignNode>) => void;
  removeNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  reorderNode: (nodeId: string, direction: "up" | "down") => void;
  toggleLock: (nodeId: string) => void;
  toggleHidden: (nodeId: string) => void;
  groupNodes: (nodeIds: string[]) => void;
  ungroupNode: (groupId: string) => void;
  nudgeNode: (nodeId: string, dx: number, dy: number) => void;

  // --- componentes con variantes (Fase 2) ---
  convertNodeToComponent: (nodeId: string, name: string) => void;
  addComponentVariant: (componentId: string, variant: Omit<ComponentVariant, "id">) => void;
  updateComponentMaster: (componentId: string, patch: Partial<DesignNode>) => void;

  // --- design tokens (Fase 2) ---
  addColorToken: (theme: string, token: ColorToken) => void;
  addTypographyToken: (theme: string, token: TypographyToken) => void;
  addSpacingToken: (theme: string, token: SpacingToken) => void;
  setDefaultTheme: (theme: string) => void;

  // --- historial ---
  undo: () => void;
  redo: () => void;
}

export const useDesignStore = create<DesignStoreState>((set, get) => {
  /** Aplica `fn` sobre la pantalla activa, registrando el documento previo en el historial. */
  function mutateScreenRoot(fn: (root: DesignNode) => DesignNode) {
    const { document, currentScreenId } = get();
    if (!document || !currentScreenId) return;
    useHistoryStore.getState().record(document);
    const screens = document.screens.map((s) => (s.id === currentScreenId ? { ...s, root: fn(s.root) } : s));
    set({ document: { ...document, screens } });
  }

  /** Aplica `fn` sobre el documento completo (tokens, componentes), registrando historial. */
  function mutateDocument(fn: (doc: DesignDocument) => DesignDocument) {
    const { document } = get();
    if (!document) return;
    useHistoryStore.getState().record(document);
    set({ document: fn(document) });
  }

  return {
    document: null,
    currentScreenId: null,
    selectedNodeId: null,
    selectedNodeIds: [],
    previewMode: false,

    setDocument: (document, resetHistory = true) => {
      if (resetHistory) useHistoryStore.getState().clear();
      set({ document, currentScreenId: document.screens[0]?.id ?? null, selectedNodeId: null, selectedNodeIds: [] });
    },

    goToScreen: (screenId) => set({ currentScreenId: screenId, selectedNodeId: null, selectedNodeIds: [] }),

    selectNode: (id) => set({ selectedNodeId: id, selectedNodeIds: id ? [id] : [] }),

    toggleSelectNode: (id, additive) =>
      set((state) => {
        if (!additive) return { selectedNodeId: id, selectedNodeIds: [id] };
        const already = state.selectedNodeIds.includes(id);
        const next = already ? state.selectedNodeIds.filter((n) => n !== id) : [...state.selectedNodeIds, id];
        return { selectedNodeIds: next, selectedNodeId: next[next.length - 1] ?? null };
      }),

    clearSelection: () => set({ selectedNodeId: null, selectedNodeIds: [] }),

    togglePreviewMode: () => set((state) => ({ previewMode: !state.previewMode, selectedNodeId: null, selectedNodeIds: [] })),

    currentScreen: () => {
      const { document, currentScreenId } = get();
      return document?.screens.find((s) => s.id === currentScreenId) ?? null;
    },

    updateNode: (nodeId, patch) => mutateScreenRoot((root) => tree.patchNode(root, nodeId, patch)),

    removeNode: (nodeId) =>
      mutateScreenRoot((root) => tree.removeNode(root, nodeId).root),

    duplicateNode: (nodeId) => mutateScreenRoot((root) => tree.duplicateNode(root, nodeId)),

    reorderNode: (nodeId, direction) => mutateScreenRoot((root) => tree.reorderSibling(root, nodeId, direction)),

    toggleLock: (nodeId) =>
      mutateScreenRoot((root) => {
        const node = tree.findNode(root, nodeId);
        return tree.patchNode(root, nodeId, { locked: !node?.locked });
      }),

    toggleHidden: (nodeId) =>
      mutateScreenRoot((root) => {
        const node = tree.findNode(root, nodeId);
        return tree.patchNode(root, nodeId, { hidden: !node?.hidden });
      }),

    groupNodes: (nodeIds) => {
      if (nodeIds.length < 2) return;
      const newGroupId = crypto.randomUUID();
      mutateScreenRoot((root) => tree.groupSiblings(root, nodeIds, newGroupId));
      set({ selectedNodeId: newGroupId, selectedNodeIds: [newGroupId] });
    },

    ungroupNode: (groupId) => mutateScreenRoot((root) => tree.ungroup(root, groupId)),

    nudgeNode: (nodeId, dx, dy) =>
      mutateScreenRoot((root) => {
        const node = tree.findNode(root, nodeId);
        if (!node) return root;
        return tree.patchNode(root, nodeId, {
          style: { ...node.style, x: (node.style?.x ?? 0) + dx, y: (node.style?.y ?? 0) + dy },
        });
      }),

    // --- componentes ---
    convertNodeToComponent: (nodeId, name) => {
      const componentId = crypto.randomUUID();
      mutateDocument((doc) => {
        const screen = doc.screens.find((s) => s.id === get().currentScreenId);
        if (!screen) return doc;
        const node = tree.findNode(screen.root, nodeId);
        if (!node) return doc;

        const master: ComponentDefinition = { id: componentId, name, root: { ...node, componentId: undefined, variantId: undefined }, variants: [] };
        const screens = doc.screens.map((s) =>
          s.id === screen.id ? { ...s, root: tree.patchNode(s.root, nodeId, { componentId, variantId: undefined }) } : s
        );
        return { ...doc, screens, components: [...doc.components, master] };
      });
    },

    addComponentVariant: (componentId, variant) =>
      mutateDocument((doc) => ({
        ...doc,
        components: doc.components.map((c) =>
          c.id === componentId ? { ...c, variants: [...c.variants, { ...variant, id: crypto.randomUUID() }] } : c
        ),
      })),

    updateComponentMaster: (componentId, patch) =>
      // Editar el maestro no toca las instancias: cada instancia solo guarda
      // `componentId`/`variantId` y el render las resuelve contra el maestro,
      // así la propagación a "todas las pantallas" (ver ROADMAP.md) es automática.
      mutateDocument((doc) => ({
        ...doc,
        components: doc.components.map((c) => (c.id === componentId ? { ...c, root: { ...c.root, ...patch } } : c)),
      })),

    // --- tokens ---
    addColorToken: (theme, token) =>
      mutateDocument((doc) => patchTheme(doc, theme, (t) => ({ ...t, colors: [...t.colors, token] }))),

    addTypographyToken: (theme, token) =>
      mutateDocument((doc) => patchTheme(doc, theme, (t) => ({ ...t, typography: [...t.typography, token] }))),

    addSpacingToken: (theme, token) =>
      mutateDocument((doc) => patchTheme(doc, theme, (t) => ({ ...t, spacing: [...t.spacing, token] }))),

    setDefaultTheme: (theme) => mutateDocument((doc) => ({ ...doc, tokens: { ...doc.tokens, defaultTheme: theme } })),

    // --- historial ---
    undo: () => {
      const { document } = get();
      if (!document) return;
      const previous = useHistoryStore.getState().undo(document);
      if (previous) set({ document: previous });
    },
    redo: () => {
      const { document } = get();
      if (!document) return;
      const next = useHistoryStore.getState().redo(document);
      if (next) set({ document: next });
    },
  };
});

function patchTheme(
  doc: DesignDocument,
  theme: string,
  fn: (t: DesignDocument["tokens"]["themes"][string]) => DesignDocument["tokens"]["themes"][string]
): DesignDocument {
  const existing = doc.tokens.themes[theme] ?? { colors: [], typography: [], spacing: [] };
  return { ...doc, tokens: { ...doc.tokens, themes: { ...doc.tokens.themes, [theme]: fn(existing) } } };
}
