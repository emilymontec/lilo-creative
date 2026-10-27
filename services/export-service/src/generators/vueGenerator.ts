import type { DesignDocument, DesignNode, Screen } from "@lilo/design-schema";
import { resolveInstance } from "@lilo/design-schema";
import { styleToTailwindClasses } from "./styleToTailwind";
import { toComponentName, toRoutePath } from "./screenSlug";

/**
 * Genera un proyecto Vue 3 (Composition API, `<script setup>`) + Tailwind +
 * vue-router — segundo framework de exportación (ver ROADMAP.md, Fase 4:
 * "diferenciador frente a v0.dev, que es React-céntrico"). Comparte
 * `styleToTailwind.ts` y `screenSlug.ts` con el generador de React para que
 * ambos produzcan exactamente el mismo resultado visual a partir del mismo
 * DesignDocument.
 */
export function generateVueProject(doc: DesignDocument): Record<string, string> {
  const files: Record<string, string> = {};
  const screensSorted = [...doc.screens].sort((a, b) => a.order - b.order);
  const routePathByScreenId = new Map(screensSorted.map((s, i) => [s.id, toRoutePath(s.name, i)]));

  for (const screen of screensSorted) {
    const componentName = toComponentName(screen.name);
    files[`src/screens/${componentName}.vue`] = generateScreenComponent(screen, doc, routePathByScreenId);
  }

  files["src/router.ts"] = generateRouter(screensSorted);
  files["src/App.vue"] = `<template>\n  <router-view />\n</template>\n`;
  files["src/main.ts"] = generateMainEntry();
  files["src/index.css"] = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`;
  files["tailwind.config.js"] = generateTailwindConfig();
  files["package.json"] = generatePackageJson();

  return files;
}

function generateScreenComponent(screen: Screen, doc: DesignDocument, routePathByScreenId: Map<string, string>): string {
  const template = renderNode(screen.root, doc, routePathByScreenId, true, 4);
  return `<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
</script>

<template>
${template}
</template>
`;
}

function renderNode(
  rawNode: DesignNode,
  doc: DesignDocument,
  routePathByScreenId: Map<string, string>,
  isRoot: boolean,
  indent: number
): string {
  const node = resolveInstance(rawNode, doc);
  if (node.hidden) return "";
  const pad = " ".repeat(indent);
  const classes = styleToTailwindClasses(node.style, doc, { isPositioningRoot: isRoot });
  const classAttr = classes ? ` class="${classes}"` : "";

  switch (node.type) {
    case "frame":
    case "stack": {
      const children = (node.children ?? [])
        .map((c) => renderNode(c, doc, routePathByScreenId, false, indent + 2))
        .filter(Boolean)
        .join("\n");
      return `${pad}<div${classAttr}>\n${children}\n${pad}</div>`;
    }
    case "text":
      return `${pad}<p${classAttr}>${escapeText(node.text ?? "")}</p>`;
    case "button": {
      const routePath = node.onPress?.type === "navigate" ? routePathByScreenId.get(node.onPress.toScreenId) : undefined;
      const onClick = routePath ? ` @click="router.push('${routePath}')"` : "";
      return `${pad}<button${classAttr}${onClick}>${escapeText(node.text ?? "Button")}</button>`;
    }
    case "input":
      return `${pad}<input${classAttr} placeholder="${escapeText(node.placeholder ?? "")}" />`;
    case "image":
      return `${pad}<img${classAttr} src="${node.src ?? ""}" alt="${escapeText(node.name ?? "")}" />`;
    case "icon":
      return `${pad}<!-- icon: ${node.iconName ?? "?"} — conectar con el set de iconos del proyecto -->`;
    case "divider":
      return `${pad}<hr${classAttr} />`;
    default:
      return "";
  }
}

function escapeText(text: string): string {
  return text.replace(/[{}]/g, (m) => (m === "{" ? "&#123;" : "&#125;"));
}

function generateRouter(screens: Screen[]): string {
  const imports = screens.map((s) => `import ${toComponentName(s.name)} from "./screens/${toComponentName(s.name)}.vue";`).join("\n");
  const routes = screens
    .map((s, i) => `  { path: "${toRoutePath(s.name, i)}", component: ${toComponentName(s.name)} },`)
    .join("\n");

  return `import { createRouter, createWebHistory } from "vue-router";
${imports}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
${routes}
  ],
});
`;
}

function generateMainEntry(): string {
  return `import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import "./index.css";

createApp(App).use(router).mount("#app");
`;
}

function generateTailwindConfig(): string {
  return `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,ts}"],
  theme: { extend: {} },
  plugins: [],
};
`;
}

function generatePackageJson(): string {
  return JSON.stringify(
    {
      name: "lilo-export-vue",
      private: true,
      version: "0.1.0",
      scripts: { dev: "vite", build: "vue-tsc && vite build", preview: "vite preview" },
      dependencies: { vue: "^3.4.0", "vue-router": "^4.4.0" },
      devDependencies: { "@vitejs/plugin-vue": "^5.1.0", tailwindcss: "^3.4.0", autoprefixer: "^10.4.0", postcss: "^8.4.0", typescript: "^5.6.0", "vue-tsc": "^2.1.0", vite: "^5.4.0" },
    },
    null,
    2
  );
}
