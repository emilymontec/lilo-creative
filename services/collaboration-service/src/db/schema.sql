CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  screen_id UUID NOT NULL,
  node_id TEXT NOT NULL, -- id del DesignNode dentro de screen.root (no es FK, vive en el árbol JSONB)
  author_id UUID NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  mentioned_user_ids UUID[] NOT NULL DEFAULT '{}',
  resolved BOOLEAN NOT NULL DEFAULT false,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_design_id ON comments(design_id);
CREATE INDEX idx_comments_node_id ON comments(design_id, node_id);
