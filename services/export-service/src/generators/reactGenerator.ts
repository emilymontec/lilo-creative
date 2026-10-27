import type { DesignDocument, DesignNode, Screen } from "@lilo/design-schema";
import { resolveInstance } from "@lilo/design-schema";
import { styleToTailwindClasses } from "./styleToTailwind";
import { slugify, toComponentName, toRoutePath } from "./screenSlug";

/**
 * Genera un proyecto React + TypeScript + Tailwind + react-router a partir
 * de un DesignDocument completo (ver ROADMAP.md, Fase 4: "exportación de
 * flujos multi-pantalla completos con el routing ya resuelto en el código
 * generado, no solo una pantalla suelta").
 *
 * Es generación por plantillas de texto, no un compilador/AST — suficiente
 * para producir componentes limpios y legibles a partir del árbol, que es
 * el objetivo ("componentes limpios, no HTML inline" — ver README del
 * servicio). No intenta reproducir layouts arbitrariamente complejos más
 * allá de lo que el esquema v1 modela (ver docs/design-schema-spec.md).
 */
export function generateReactProject(doc: DesignDocument): Record<string, string> {
  const files: Record<string, string> = {};

  const screensSorted = [...doc.screens].sort((a, b) => a.order - b.order);
  const navByTrigger = new Map(doc.navigation.map((n) => [n.triggerNodeId, n]));

  const routePathByScreenId = new Map(screensSorted.map((s, i) => [s.id, toRoutePath(s.name, i)]));

  for (const screen of screensSorted) {
    const componentName = toComponentName(screen.name);
    files[`src/screens/${componentName}.tsx`] = generateScreenComponent(screen, doc, componentName, routePathByScreenId);
  }

  files["src/App.tsx"] = generateRouterApp(screensSorted);
  files["src/main.tsx"] = generateMainEntry();
  files["src/index.css"] = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`;
  files["tailwind.config.js"] = generateTailwindConfig();
  files["package.json"] = generatePackageJson(doc);
  files["README.md"] = generateReadme(doc, screensSorted);

  return files;
}

function generateScreenComponent(
  screen: Screen,
  doc: DesignDocument,
  componentName: string,
  routePathByScreenId: Map<string, string>
): string {
  const body = renderNode(screen.root, doc, routePathByScreenId, true);

  return `import { useNavigate } from "react-router-dom";

/** Generado desde la pantalla "${screen.name}" del DesignDocument. No edites a mano si vas a regenerar. */
export default function ${componentName}() {
  const navigate = useNavigate();

${body}
}
`;
}

function renderNode(
  rawNode: DesignNode,
  doc: DesignDocument,
  routePathByScreenId: Map<string, string>,
  isRoot: boolean,
  indent = 2
): string {
  const node = resolveInstance(rawNode, doc);
  if (node.hidden) return "";
  const pad = " ".repeat(indent);
  const classes = styleToTailwindClasses(node.style, doc, { isPositioningRoot: isRoot });
  const classAttr = classes ? ` className="${classes}"` : "";

  switch (node.type) {
    case "frame":
    case "stack": {
      const children = (node.children ?? [])
        .map((c) => renderNode(c, doc, routePathByScreenId, false, indent + 2))
        .filter(Boolean)
        .join("\n");
      const wrapper = `${pad}  <div${classAttr}>\n${children}\n${pad}  </div>`;
      return isRoot ? `${pad}return (\n${wrapper}\n${pad});` : wrapper;
    }
    case "text":
      return `${pad}<p${classAttr}>${escapeJsxText(node.text ?? "")}</p>`;
    case "button": {
      const routePath = node.onPress?.type === "navigate" ? routePathByScreenId.get(node.onPress.toScreenId) : undefined;
      const onClick = routePath ? ` onClick={() => navigate("${routePath}")}` : "";
      return `${pad}<button${classAttr}${onClick}>${escapeJsxText(node.text ?? "Button")}</button>`;
    }
    case "input":
      return `${pad}<input${classAttr} placeholder="${escapeJsxText(node.placeholder ?? "")}" />`;
    case "image":
      return `${pad}<img${classAttr} src="${node.src ?? ""}" alt="${escapeJsxText(node.name ?? "")}" />`;
    case "icon":
      return `${pad}{/* icon: ${node.iconName ?? "?"} — conectar con el set de iconos del proyecto (ej. lucide-react) */}`;
    case "divider":
      return `${pad}<hr${classAttr} />`;
    default:
      return "";
  }
}

function escapeJsxText(text: string): string {
  return text.replace(/[{}]/g, (m) => (m === "{" ? "&#123;" : "&#125;"));
}

function generateRouterApp(screens: Screen[]): string {
  const imports = screens.map((s) => `import ${toComponentName(s.name)} from "./screens/${toComponentName(s.name)}";`).join("\n");
  const routes = screens
    .map((s, i) => `        <Route path="${toRoutePath(s.name, i)}" element={<${toComponentName(s.name)} />} />`)
    .join("\n");

  return `import { BrowserRouter, Routes, Route } from "react-router-dom";
${imports}

/** Router generado a partir de "navigation" del DesignDocument — una ruta por pantalla. */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
${routes}
      </Routes>
    </BrowserRouter>
  );
}
`;
}

function generateMainEntry(): string {
  return `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
`;
}

function generateTailwindConfig(): string {
  return `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
`;
}

function generatePackageJson(doc: DesignDocument): string {
  return JSON.stringify(
    {
      name: "lilo-export-react",
      private: true,
      version: "0.1.0",
      scripts: { dev: "vite", build: "tsc && vite build", preview: "vite preview" },
      dependencies: { react: "^18.3.0", "react-dom": "^18.3.0", "react-router-dom": "^6.26.0" },
      devDependencies: { "@vitejs/plugin-react": "^4.3.0", tailwindcss: "^3.4.0", autoprefixer: "^10.4.0", postcss: "^8.4.0", typescript: "^5.6.0", vite: "^5.4.0" },
    },
    null,
    2
  );
}

function generateReadme(doc: DesignDocument, screens: Screen[]): string {
  return `# Exportado desde Lilo Creative

Proyecto React + TypeScript + Tailwind generado a partir de un DesignDocument
de ${screens.length} pantalla(s). Instalar y correr:

\`\`\`bash
npm install
npm run dev
\`\`\`

Este código es un punto de partida editable — no se vuelve a sincronizar
automáticamente con el diseño en Lilo Creative si lo modificás a mano.
`;
}
