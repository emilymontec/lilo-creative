import type { DesignNode } from "@lilo/design-schema";

/**
 * Operaciones inmutables sobre un árbol de DesignNode de una sola pantalla.
 * Todas devuelven un nuevo `root` sin mutar el original — el store decide
 * cuándo registrar el resultado en el historial (undo/redo).
 */

export function findNode(root: DesignNode, id: string): DesignNode | null {
  if (root.id === id) return root;
  for (const child of root.children ?? []) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

export function findParentId(root: DesignNode, childId: string): string | null {
  for (const child of root.children ?? []) {
    if (child.id === childId) return root.id;
    const found = findParentId(child, childId);
    if (found) return found;
  }
  return null;
}

export function patchNode(root: DesignNode, nodeId: string, patch: Partial<DesignNode>): DesignNode {
  if (root.id === nodeId) return { ...root, ...patch };
  if (!root.children?.length) return root;
  return { ...root, children: root.children.map((c) => patchNode(c, nodeId, patch)) };
}

export function removeNode(root: DesignNode, nodeId: string): { root: DesignNode; removed: DesignNode | null } {
  let removed: DesignNode | null = null;
  function walk(node: DesignNode): DesignNode {
    const children = (node.children ?? []).filter((c) => {
      if (c.id === nodeId) {
        removed = c;
        return false;
      }
      return true;
    });
    return { ...node, children: children.map(walk) };
  }
  return { root: walk(root), removed };
}

export function insertChild(root: DesignNode, parentId: string, node: DesignNode, index?: number): DesignNode {
  if (root.id === parentId) {
    const children = [...(root.children ?? [])];
    const at = index === undefined ? children.length : Math.max(0, Math.min(index, children.length));
    children.splice(at, 0, node);
    return { ...root, children };
  }
  return { ...root, children: (root.children ?? []).map((c) => insertChild(c, parentId, node, index)) };
}

/** Mueve un nodo una posición arriba/abajo entre sus hermanos (reordenar en el panel de capas). */
export function reorderSibling(root: DesignNode, nodeId: string, direction: "up" | "down"): DesignNode {
  function walk(node: DesignNode): DesignNode {
    const children = node.children ?? [];
    const idx = children.findIndex((c) => c.id === nodeId);
    if (idx !== -1) {
      const swapWith = direction === "up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= children.length) return { ...node, children: children.map(walk) };
      const next = [...children];
      [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
      return { ...node, children: next.map(walk) };
    }
    return { ...node, children: children.map(walk) };
  }
  return walk(root);
}

/** Envuelve los nodos indicados (deben ser hermanos) en un nuevo "stack" — agrupar. */
export function groupSiblings(root: DesignNode, nodeIds: string[], newGroupId: string): DesignNode {
  function walk(node: DesignNode): DesignNode {
    const children = node.children ?? [];
    const selected = children.filter((c) => nodeIds.includes(c.id));
    if (selected.length === nodeIds.length && selected.length > 0) {
      const firstIndex = children.findIndex((c) => nodeIds.includes(c.id));
      const rest = children.filter((c) => !nodeIds.includes(c.id));
      const group: DesignNode = {
        id: newGroupId,
        type: "stack",
        name: "Group",
        style: { direction: "column" },
        children: selected,
      };
      rest.splice(firstIndex, 0, group);
      return { ...node, children: rest.map(walk) };
    }
    return { ...node, children: children.map(walk) };
  }
  return walk(root);
}

/** Reemplaza un nodo "stack" de grupo por sus hijos directos, en su misma posición — desagrupar. */
export function ungroup(root: DesignNode, groupId: string): DesignNode {
  function walk(node: DesignNode): DesignNode {
    const children = node.children ?? [];
    const idx = children.findIndex((c) => c.id === groupId);
    if (idx !== -1) {
      const group = children[idx];
      const next = [...children.slice(0, idx), ...(group.children ?? []), ...children.slice(idx + 1)];
      return { ...node, children: next.map(walk) };
    }
    return { ...node, children: children.map(walk) };
  }
  return walk(root);
}

function cloneWithNewIds(node: DesignNode): DesignNode {
  return {
    ...node,
    id: crypto.randomUUID(),
    children: (node.children ?? []).map(cloneWithNewIds),
  };
}

/** Duplica un nodo (y su subárbol, con ids nuevos) como hermano inmediatamente siguiente. */
export function duplicateNode(root: DesignNode, nodeId: string): DesignNode {
  function walk(node: DesignNode): DesignNode {
    const children = node.children ?? [];
    const idx = children.findIndex((c) => c.id === nodeId);
    if (idx !== -1) {
      const copy = cloneWithNewIds(children[idx]);
      const next = [...children.slice(0, idx + 1), copy, ...children.slice(idx + 1)];
      return { ...node, children: next.map(walk) };
    }
    return { ...node, children: children.map(walk) };
  }
  return walk(root);
}
