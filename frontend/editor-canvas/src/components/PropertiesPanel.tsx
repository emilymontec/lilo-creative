import { useDesignStore } from "../store/designStore";
import * as tree from "../store/treeUtils";

/**
 * Panel de propiedades del nodo seleccionado — ya conectado a design tokens
 * (ver ROADMAP.md, Fase 1 Sprint 6: "panel de propiedades ... ya conectado a
 * design tokens, no solo valores sueltos").
 */
export function PropertiesPanel() {
  const screen = useDesignStore((s) => s.currentScreen());
  const selectedNodeId = useDesignStore((s) => s.selectedNodeId);
  const updateNode = useDesignStore((s) => s.updateNode);
  const document = useDesignStore((s) => s.document);

  if (!screen || !selectedNodeId || !document) return null;
  const node = tree.findNode(screen.root, selectedNodeId);
  if (!node) return null;

  const colorTokens = document.tokens.themes[document.tokens.defaultTheme]?.colors ?? [];

  return (
    <aside>
      <h3>Propiedades — {node.name ?? node.type}</h3>

      {(node.type === "text" || node.type === "button") && (
        <label>
          Texto
          <input value={node.text ?? ""} onChange={(e) => updateNode(node.id, { text: e.target.value })} />
        </label>
      )}

      <label>
        Color de relleno (token)
        <select
          value={node.style?.fill?.color ?? ""}
          onChange={(e) =>
            updateNode(node.id, { style: { ...node.style, fill: { type: "solid", color: e.target.value } } })
          }
        >
          <option value="">— valor suelto —</option>
          {colorTokens.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </label>

      <label>
        Espaciado (padding)
        <input
          type="number"
          value={node.style?.padding ?? 0}
          onChange={(e) => updateNode(node.id, { style: { ...node.style, padding: Number(e.target.value) } })}
        />
      </label>
    </aside>
  );
}
