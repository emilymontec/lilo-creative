-- Esquema relacional de design-tree-service.
-- El árbol de cada pantalla vive en JSONB (`screens.root`); lo relacional
-- (proyectos, versiones, componentes, tokens, pantallas, navegación) vive
-- en tablas normales para poder consultar/filtrar sin parsear JSON.

CREATE TABLE designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id),
  owner_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  schema_version TEXT NOT NULL DEFAULT '1.0',
  tokens JSONB NOT NULL DEFAULT '{"defaultTheme":"light","themes":{"light":{"colors":[],"typography":[],"spacing":[]}}}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE screens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  root JSONB NOT NULL, -- DesignNode raíz (tipo "frame"), ver @lilo/design-schema
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE navigation_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  from_screen_id UUID NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  trigger_node_id TEXT NOT NULL, -- id del DesignNode dentro de from_screen.root
  to_screen_id UUID NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'push' CHECK (mode IN ('push', 'replace', 'modal'))
);

CREATE TABLE components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  root JSONB NOT NULL, -- DesignNode maestro
  variants JSONB NOT NULL DEFAULT '[]', -- ComponentVariant[]
  default_variant_id TEXT
);

-- Versionado tipo Git: snapshot inmutable del documento completo
-- (todas las pantallas + navegación + componentes + tokens) en cada punto
-- relevante. El undo/redo del editor opera sobre este historial.
CREATE TABLE design_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  snapshot JSONB NOT NULL, -- DesignDocument completo serializado
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  label TEXT -- ej. "autosave", "restore point", nombre dado por el usuario
);

CREATE INDEX idx_screens_design_id ON screens(design_id);
CREATE INDEX idx_navigation_design_id ON navigation_links(design_id);
CREATE INDEX idx_components_design_id ON components(design_id);
CREATE INDEX idx_versions_design_id ON design_versions(design_id, created_at DESC);
