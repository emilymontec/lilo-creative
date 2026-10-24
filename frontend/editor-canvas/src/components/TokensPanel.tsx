import { useDesignStore } from "../store/designStore";

/**
 * Panel de estilos globales (Fase 2, "Semanas 6-7: Design tokens").
 * Agregar tokens de color/tipografía/espaciado por tema y cambiar el tema
 * por defecto — ya con soporte de temas (ej. light/dark) desde el esquema.
 */
export function TokensPanel() {
  const document = useDesignStore((s) => s.document);
  const addColorToken = useDesignStore((s) => s.addColorToken);
  const setDefaultTheme = useDesignStore((s) => s.setDefaultTheme);

  if (!document) return null;
  const { tokens } = document;

  return (
    <aside>
      <h3>Design tokens</h3>
      <label>
        Tema por defecto:
        <select value={tokens.defaultTheme} onChange={(e) => setDefaultTheme(e.target.value)}>
          {Object.keys(tokens.themes).map((theme) => (
            <option key={theme} value={theme}>{theme}</option>
          ))}
        </select>
      </label>

      <h4>Colores ({tokens.defaultTheme})</h4>
      <ul>
        {(tokens.themes[tokens.defaultTheme]?.colors ?? []).map((c) => (
          <li key={c.id}>
            <span style={{ display: "inline-block", width: 12, height: 12, background: c.value }} />
            {c.name} — {c.value}
          </li>
        ))}
      </ul>
      <button
        onClick={() => {
          const name = window.prompt("Nombre del token (ej. Primary)");
          const value = window.prompt("Color (#RRGGBB)");
          if (name && value) {
            addColorToken(tokens.defaultTheme, { id: `color.${name.toLowerCase()}`, name, value });
          }
        }}
      >
        + Color
      </button>
    </aside>
  );
}
