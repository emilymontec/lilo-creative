import { useDesignStore } from "../store/designStore";

/**
 * Biblioteca de componentes del proyecto (Fase 2, "Semanas 3-5"). Convertir
 * la selección actual en componente, y agregar variantes al maestro.
 * Editar el maestro (updateComponentMaster) se expone desde aquí; el patch
 * real de estilos se arma en PropertiesPanel cuando la selección activa es
 * un componente maestro, no una instancia.
 */
export function ComponentsPanel() {
  const document = useDesignStore((s) => s.document);
  const selectedNodeId = useDesignStore((s) => s.selectedNodeId);
  const convertNodeToComponent = useDesignStore((s) => s.convertNodeToComponent);
  const addComponentVariant = useDesignStore((s) => s.addComponentVariant);

  if (!document) return null;

  return (
    <aside>
      <h3>Componentes</h3>
      {selectedNodeId && (
        <button
          onClick={() => {
            const name = window.prompt("Nombre del componente");
            if (name) convertNodeToComponent(selectedNodeId, name);
          }}
        >
          Convertir selección en componente
        </button>
      )}
      <ul>
        {document.components.map((c) => (
          <li key={c.id}>
            {c.name} — {c.variants.length} variante(s)
            <button
              onClick={() => {
                const name = window.prompt("Nombre de la variante (ej. secondary, disabled)");
                if (name) addComponentVariant(c.id, { name, styleOverrides: {} });
              }}
            >
              + Variante
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
