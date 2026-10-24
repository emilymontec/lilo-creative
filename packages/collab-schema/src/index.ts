import * as Y from "yjs";
import type { DesignDocument, DesignNode, Screen, ComponentDefinition, NavigationLink, DesignTokens } from "@lilo/design-schema";

/**
 * Conversión DesignDocument <-> Y.Doc, a nivel de nodo (no un solo blob
 * JSON por documento). Cada DesignNode es un Y.Map propio con un Y.Array de
 * hijos, y cada pantalla/componente es un Y.Map propio dentro de un
 * Y.Array — así dos clientes editando nodos distintos (o incluso pantallas
 * distintas) generan operaciones Yjs independientes que Yjs mergea sin
 * pérdida de datos, que es justamente lo que valida el Spike B de
 * ROADMAP.md Fase 0 antes de construir el resto de Fase 3 sobre esto.
 *
 * Límite conocido de esta primera versión: una edición de `updateNode` en
 * el cliente reemplaza el Y.Map del nodo completo (ver `syncNodeIntoYMap`)
 * en vez de solo las claves que cambiaron, así que dos ediciones
 * *simultáneas sobre el mismo nodo* siguen resolviéndose por última
 * escritura gana a nivel de nodo, no por campo. Nodos y pantallas
 * distintos sí mergean sin conflicto. Pasar a un merge por campo es un
 * cambio aislado a `syncNodeIntoYMap`, no a la forma del documento.
 */

export function nodeToYMap(node: DesignNode): Y.Map<any> {
  const map = new Y.Map<any>();
  writeNodeFields(map, node);
  const children = new Y.Array<Y.Map<any>>();
  children.push((node.children ?? []).map(nodeToYMap));
  map.set("children", children);
  return map;
}

function writeNodeFields(map: Y.Map<any>, node: DesignNode) {
  map.set("id", node.id);
  map.set("type", node.type);
  map.set("style", node.style ?? {});
  const optionalFields: (keyof DesignNode)[] = [
    "name", "text", "placeholder", "iconName", "src", "componentId", "variantId", "onPress", "locked", "hidden",
  ];
  for (const field of optionalFields) {
    const value = node[field];
    if (value !== undefined) map.set(field as string, value);
    else map.delete(field as string);
  }
}

/** Reemplaza los campos propios de un nodo (no sus hijos) — usado al editar el nodo activo desde el cliente. */
export function syncNodeIntoYMap(map: Y.Map<any>, node: DesignNode) {
  writeNodeFields(map, node);
}

export function yMapToNode(map: Y.Map<any>): DesignNode {
  const childrenArr = map.get("children") as Y.Array<Y.Map<any>> | undefined;
  return {
    id: map.get("id"),
    type: map.get("type"),
    name: map.get("name"),
    style: map.get("style") ?? {},
    text: map.get("text"),
    placeholder: map.get("placeholder"),
    iconName: map.get("iconName"),
    src: map.get("src"),
    componentId: map.get("componentId"),
    variantId: map.get("variantId"),
    onPress: map.get("onPress"),
    locked: map.get("locked"),
    hidden: map.get("hidden"),
    children: childrenArr ? childrenArr.toArray().map(yMapToNode) : [],
  } as DesignNode;
}

export function screenToYMap(screen: Screen): Y.Map<any> {
  const map = new Y.Map<any>();
  map.set("id", screen.id);
  map.set("name", screen.name);
  map.set("order", screen.order);
  map.set("root", nodeToYMap(screen.root));
  return map;
}
export function yMapToScreen(map: Y.Map<any>): Screen {
  return { id: map.get("id"), name: map.get("name"), order: map.get("order"), root: yMapToNode(map.get("root")) };
}

export function componentToYMap(c: ComponentDefinition): Y.Map<any> {
  const map = new Y.Map<any>();
  map.set("id", c.id);
  map.set("name", c.name);
  map.set("root", nodeToYMap(c.root));
  map.set("variants", c.variants);
  if (c.defaultVariantId) map.set("defaultVariantId", c.defaultVariantId);
  return map;
}
export function yMapToComponent(map: Y.Map<any>): ComponentDefinition {
  return {
    id: map.get("id"),
    name: map.get("name"),
    root: yMapToNode(map.get("root")),
    variants: map.get("variants") ?? [],
    defaultVariantId: map.get("defaultVariantId"),
  };
}

/** Crea un Y.Doc nuevo a partir de un DesignDocument (snapshot inicial de una sala de colaboración). */
export function documentToYDoc(doc: DesignDocument): Y.Doc {
  const ydoc = new Y.Doc();
  const root = ydoc.getMap<any>("document");
  Y.transact(ydoc, () => {
    root.set("schemaVersion", doc.schemaVersion);

    const screens = new Y.Array<Y.Map<any>>();
    screens.push(doc.screens.map(screenToYMap));
    root.set("screens", screens);

    const navigation = new Y.Array<NavigationLink>();
    navigation.push(doc.navigation);
    root.set("navigation", navigation);

    const components = new Y.Array<Y.Map<any>>();
    components.push(doc.components.map(componentToYMap));
    root.set("components", components);

    root.set("tokens", doc.tokens);
  });
  return ydoc;
}

/** Lee el estado actual completo de un Y.Doc como DesignDocument — para persistir o para hidratar un cliente nuevo. */
export function yDocToDocument(ydoc: Y.Doc): DesignDocument {
  const root = ydoc.getMap<any>("document");
  const screens = (root.get("screens") as Y.Array<Y.Map<any>> | undefined)?.toArray().map(yMapToScreen) ?? [];
  const components = (root.get("components") as Y.Array<Y.Map<any>> | undefined)?.toArray().map(yMapToComponent) ?? [];
  const navigation = (root.get("navigation") as Y.Array<NavigationLink> | undefined)?.toArray() ?? [];
  const tokens = (root.get("tokens") as DesignTokens | undefined) ?? { defaultTheme: "light", themes: {} };
  return { schemaVersion: "1.0", screens, navigation, components, tokens };
}

/** Reemplaza solo el `root` de una pantalla dentro del Y.Doc (edición granular por pantalla). */
export function replaceScreenRoot(ydoc: Y.Doc, screenId: string, newRoot: DesignNode) {
  const root = ydoc.getMap<any>("document");
  const screens = root.get("screens") as Y.Array<Y.Map<any>>;
  Y.transact(ydoc, () => {
    for (let i = 0; i < screens.length; i++) {
      if (screens.get(i).get("id") === screenId) {
        screens.get(i).set("root", nodeToYMap(newRoot));
        return;
      }
    }
  });
}
