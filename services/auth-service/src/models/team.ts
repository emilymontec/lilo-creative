/**
 * Modelo de equipos — definido desde la Fase 1 (no se agrega después).
 * Un diseño (`designs.team_id` en design-tree-service) siempre pertenece a
 * un equipo, incluso cuando ese equipo tiene un solo miembro (el dueño).
 */
export interface Team {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

export type TeamRole = "admin" | "editor" | "commenter" | "viewer";

export interface TeamMember {
  teamId: string;
  userId: string;
  role: TeamRole;
  invitedAt: string;
  joinedAt?: string;
}
