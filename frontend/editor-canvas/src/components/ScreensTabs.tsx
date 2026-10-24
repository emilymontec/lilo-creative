import { useDesignStore } from "../store/designStore";

/**
 * Navegación entre pantallas del proyecto (Fase 1 del roadmap: "navegación
 * entre pantallas dentro del editor, no solo una pantalla suelta").
 */
export function ScreensTabs() {
  const document = useDesignStore((s) => s.document);
  const currentScreenId = useDesignStore((s) => s.currentScreenId);
  const goToScreen = useDesignStore((s) => s.goToScreen);

  if (!document) return null;

  return (
    <div role="tablist" style={{ display: "flex", gap: 4 }}>
      {document.screens
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((screen) => (
          <button
            key={screen.id}
            role="tab"
            aria-selected={screen.id === currentScreenId}
            onClick={() => goToScreen(screen.id)}
          >
            {screen.name}
          </button>
        ))}
    </div>
  );
}
