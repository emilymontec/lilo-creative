import { useEffect, useState } from "react";
import { useDesignStore } from "../store/designStore";

interface Comment {
  id: string;
  body: string;
  authorId: string;
  nodeId: string;
  resolved: boolean;
}

/**
 * Comentarios anclados al elemento seleccionado (ver ROADMAP.md, Fase 3
 * "Semanas 6-7: Comentarios"). Pega directo contra `collaboration-service`;
 * en producción esto debería pasar por `api-gateway` igual que el resto de
 * llamadas — se deja directo aquí para no acoplar este componente a la
 * configuración de rutas del gateway, que todavía es un TODO.
 */
export function CommentsPanel({
  designId,
  currentUserId,
  collaborationServiceUrl = "http://localhost:4005",
}: {
  designId: string | null;
  currentUserId: string;
  collaborationServiceUrl?: string;
}) {
  const selectedNodeId = useDesignStore((s) => s.selectedNodeId);
  const currentScreenId = useDesignStore((s) => s.currentScreenId);
  const [comments, setComments] = useState<Comment[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!designId) return;
    fetch(`${collaborationServiceUrl}/designs/${designId}/comments`)
      .then((r) => r.json())
      .then(setComments)
      .catch(() => setComments([]));
  }, [designId, collaborationServiceUrl]);

  if (!designId) return null;
  if (!selectedNodeId) {
    return (
      <aside>
        <h3>Comentarios</h3>
        <p>Selecciona un elemento para ver o dejar comentarios.</p>
      </aside>
    );
  }

  const nodeComments = comments.filter((c) => c.nodeId === selectedNodeId);

  async function submit() {
    if (!draft.trim() || !currentScreenId || !selectedNodeId) return;
    const res = await fetch(`${collaborationServiceUrl}/designs/${designId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ screenId: currentScreenId, nodeId: selectedNodeId, authorId: currentUserId, body: draft }),
    });
    const created = await res.json();
    setComments((prev) => [...prev, created]);
    setDraft("");
  }

  return (
    <aside>
      <h3>Comentarios</h3>
      <ul>
        {nodeComments.map((c) => (
          <li key={c.id}>{c.body}</li>
        ))}
      </ul>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Comentar (@usuario para mencionar)"
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <button onClick={submit}>Enviar</button>
    </aside>
  );
}
