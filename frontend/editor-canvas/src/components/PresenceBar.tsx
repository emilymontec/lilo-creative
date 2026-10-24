import { useEffect, useState } from "react";
import type { Awareness } from "y-protocols/awareness";

/**
 * Indicadores de presencia (ver ROADMAP.md, Fase 3 "Semanas 4-5: Presencia
 * y permisos en vivo"): un avatar por cada cliente conectado a la sala,
 * leído del estado de Awareness que publica `useCollaboration`.
 */
export function PresenceBar({ awareness }: { awareness: Awareness | null }) {
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (!awareness) return;
    const onChange = () => forceRender((n) => n + 1);
    awareness.on("change", onChange);
    return () => awareness.off("change", onChange);
  }, [awareness]);

  if (!awareness) return null;

  const states = Array.from(awareness.getStates().entries()) as Array<
    [number, { user?: { name: string; color: string } }]
  >;

  return (
    <div style={{ display: "flex", gap: 4 }}>
      {states.map(([clientId, state]) => (
        <span
          key={clientId}
          title={state.user?.name}
          style={{
            background: state.user?.color ?? "#999999",
            borderRadius: "50%",
            width: 24,
            height: 24,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            fontSize: 10,
          }}
        >
          {(state.user?.name ?? "?").slice(0, 2).toUpperCase()}
        </span>
      ))}
    </div>
  );
}
