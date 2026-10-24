import type { DesignNode } from "@lilo/design-schema";
import { useDesignStore } from "../store/designStore";

/**
 * Panel de capas: árbol visual de elementos de la pantalla activa, con
 * reordenar, bloquear/ocultar y agrupar/desagrupar (ver ROADMAP.md, Fase 2
 * "Semanas 1-2: Capas y jerarquía").
 *
 * El reordenado aquí usa botones arriba/abajo (`reorderNode`) en vez de
 * drag & drop — drag & drop real se conecta sobre esta misma acción del
 * store cuando se implemente el gesto en el canvas; la lógica de mover un
 * nodo entre hermanos ya vive en `treeUtils.reorderSibling` y no cambia.
 */
export function LayersPanel() {
  const screen = useDesignStore((s) => s.currentScreen());
  const selectedNodeId = useDesignStore((s) => s.selectedNodeId);
  const selectNode = useDesignStore((s) => s.selectNode);
  const reorderNode = useDesignStore((s) => s.reorderNode);
  const toggleLock = useDesignStore((s) => s.toggleLock);
  const toggleHidden = useDesignStore((s) => s.toggleHidden);
  const groupNodes = useDesignStore((s) => s.groupNodes);
  const ungroupNode = useDesignStore((s) => s.ungroupNode);

  if (!screen) return null;

  function renderNode(node: DesignNode, depth: number) {
    const isSelected = node.id === selectedNodeId;
    return (
      <div key={node.id}>
        <div
          style={{ paddingLeft: depth * 12, opacity: node.hidden ? 0.4 : 1, fontWeight: isSelected ? 700 : 400 }}
          onClick={() => selectNode(node.id)}
        >
          <span>{node.name ?? node.type}</span>
          <button onClick={(e) => { e.stopPropagation(); toggleHidden(node.id); }} aria-label="Ocultar/mostrar">
            {node.hidden ? "🚫" : "👁"}
          </button>
          <button onClick={(e) => { e.stopPropagation(); toggleLock(node.id); }} aria-label="Bloquear/desbloquear">
            {node.locked ? "🔒" : "🔓"}
          </button>
          <button onClick={(e) => { e.stopPropagation(); reorderNode(node.id, "up"); }} aria-label="Subir">↑</button>
          <button onClick={(e) => { e.stopPropagation(); reorderNode(node.id, "down"); }} aria-label="Bajar">↓</button>
          {node.type === "stack" && node.name === "Group" && (
            <button onClick={(e) => { e.stopPropagation(); ungroupNode(node.id); }}>Desagrupar</button>
          )}
        </div>
        {node.children?.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  }

  return (
    <aside>
      <h3>Capas</h3>
      {renderNode(screen.root, 0)}
      {/* Agrupar: selección múltiple de capas queda pendiente de UI de multi-selección en el canvas;
          mientras tanto se puede invocar groupNodes([...ids]) desde ahí una vez implementada. */}
    </aside>
  );
}
