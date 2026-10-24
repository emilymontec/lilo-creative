import type { ReactNode } from "react";
import { Stage, Layer, Group, Rect, Text, Line } from "react-konva";
import type { DesignNode } from "@lilo/design-schema";
import { useDesignStore } from "../store/designStore";
import { resolveInstance, resolveFill, resolveColor } from "./nodeResolution";

const DEFAULT_FONT_SIZE = 14;
const SELECTION_COLOR = "#6E56CF";

/**
 * Renderiza la pantalla activa del DesignDocument como elementos Konva
 * interactivos: mapeo completo de los 8 tipos de nodo del esquema,
 * resolución de instancias de componente contra su maestro+variante,
 * selección (simple y múltiple con Shift+click), drag para mover, y modo
 * preview donde los botones con `onPress` navegan en vez de seleccionar
 * (ver ROADMAP.md, Fase 1 "Motor de canvas" y Fase 2).
 *
 * Nota de alcance: el layout de "stack" con `direction` hace un auto-layout
 * simple (apila hijos en fila/columna usando su `width`/`height` + `gap`),
 * suficiente para flujos generados por IA; un auto-layout completo estilo
 * Figma (wrap, min/max, distribución avanzada) queda fuera del esquema v1
 * (ver docs/design-schema-spec.md, sección 8, extensión futura).
 * Los handles de resize (redimensionar arrastrando una esquina) también
 * quedan como TODO — hoy el tamaño se edita desde PropertiesPanel.
 */
export function CanvasRenderer() {
  const screen = useDesignStore((s) => s.currentScreen());
  const document = useDesignStore((s) => s.document);
  const selectedNodeId = useDesignStore((s) => s.selectedNodeId);
  const selectedNodeIds = useDesignStore((s) => s.selectedNodeIds);
  const selectNode = useDesignStore((s) => s.selectNode);
  const toggleSelectNode = useDesignStore((s) => s.toggleSelectNode);
  const clearSelection = useDesignStore((s) => s.clearSelection);
  const updateNode = useDesignStore((s) => s.updateNode);
  const previewMode = useDesignStore((s) => s.previewMode);
  const goToScreen = useDesignStore((s) => s.goToScreen);

  if (!screen || !document) return null;

  function handleClick(node: DesignNode, evt: any) {
    evt.cancelBubble = true;
    if (previewMode) {
      if (node.onPress?.type === "navigate") goToScreen(node.onPress.toScreenId);
      return;
    }
    if (evt.evt?.shiftKey) toggleSelectNode(node.id, true);
    else selectNode(node.id);
  }

  function handleDragEnd(node: DesignNode, evt: any) {
    updateNode(node.id, { style: { ...node.style, x: evt.target.x(), y: evt.target.y() } });
  }

  function renderNode(rawNode: DesignNode, overridePos?: { x: number; y: number }): ReactNode {
    const node = resolveInstance(rawNode, document!);
    if (node.hidden) return null;

    const isSelected = node.id === selectedNodeId || selectedNodeIds.includes(node.id);
    const x = overridePos?.x ?? node.style?.x ?? 0;
    const y = overridePos?.y ?? node.style?.y ?? 0;
    const width = node.style?.width ?? defaultSizeFor(node.type).width;
    const height = node.style?.height ?? defaultSizeFor(node.type).height;
    const draggable = !node.locked && !previewMode && node.type !== "frame";

    const common = {
      key: node.id,
      x,
      y,
      draggable,
      onClick: (e: any) => handleClick(node, e),
      onDragEnd: (e: any) => handleDragEnd(node, e),
    };

    switch (node.type) {
      case "frame":
        return (
          <Group {...common} draggable={false}>
            <Rect
              width={width}
              height={height}
              fill={resolveFill(node.style, document!) ?? "#FFFFFF"}
              cornerRadius={node.style?.radius ?? 0}
            />
            {node.children?.map((child) => renderNode(child))}
          </Group>
        );

      case "stack": {
        const children = node.children ?? [];
        const dir = node.style?.direction;
        const gap = node.style?.gap ?? 0;
        let offset = node.style?.padding ?? 0;
        return (
          <Group {...common}>
            {node.style?.fill && (
              <Rect width={width} height={height} fill={resolveFill(node.style, document!)} cornerRadius={node.style?.radius ?? 0} />
            )}
            {children.map((child) => {
              if (!dir) return renderNode(child);
              const resolvedChild = resolveInstance(child, document!);
              const childSize = defaultSizeFor(resolvedChild.type);
              const pos = dir === "row" ? { x: offset, y: node.style?.padding ?? 0 } : { x: node.style?.padding ?? 0, y: offset };
              const advance = (dir === "row" ? (resolvedChild.style?.width ?? childSize.width) : (resolvedChild.style?.height ?? childSize.height)) + gap;
              offset += advance;
              return renderNode(child, pos);
            })}
          </Group>
        );
      }

      case "text":
        return (
          <Text
            {...common}
            text={node.text ?? ""}
            fontSize={DEFAULT_FONT_SIZE}
            fill={resolveFill(node.style, document!) ?? "#111111"}
            stroke={isSelected ? SELECTION_COLOR : undefined}
            strokeWidth={isSelected ? 0.5 : 0}
          />
        );

      case "button":
        return (
          <Group {...common}>
            <Rect
              width={width}
              height={height}
              fill={resolveFill(node.style, document!) ?? "#6E56CF"}
              cornerRadius={node.style?.radius ?? 6}
              stroke={isSelected ? SELECTION_COLOR : undefined}
              strokeWidth={isSelected ? 2 : 0}
            />
            <Text text={node.text ?? "Button"} fontSize={DEFAULT_FONT_SIZE} fill="#FFFFFF" width={width} height={height} align="center" verticalAlign="middle" listening={false} />
          </Group>
        );

      case "input":
        return (
          <Group {...common}>
            <Rect width={width} height={height} fill="#FFFFFF" stroke={isSelected ? SELECTION_COLOR : "#CCCCCC"} strokeWidth={isSelected ? 2 : 1} cornerRadius={node.style?.radius ?? 4} />
            <Text text={node.placeholder ?? ""} fontSize={DEFAULT_FONT_SIZE} fill="#999999" x={8} y={(height - DEFAULT_FONT_SIZE) / 2} listening={false} />
          </Group>
        );

      case "image":
        return (
          <Group {...common}>
            <Rect width={width} height={height} fill="#E5E5E5" stroke={isSelected ? SELECTION_COLOR : "#BBBBBB"} dash={[4, 4]} />
            <Text text={node.name ?? "image"} fontSize={11} fill="#999999" x={4} y={4} listening={false} />
          </Group>
        );

      case "icon":
        return (
          <Group {...common}>
            <Rect width={24} height={24} fill="transparent" stroke={isSelected ? SELECTION_COLOR : "#999999"} cornerRadius={4} />
            <Text text={(node.iconName ?? "?").slice(0, 2)} fontSize={10} fill="#999999" x={4} y={6} listening={false} />
          </Group>
        );

      case "divider":
        return (
          <Line
            {...common}
            points={[0, 0, width, 0]}
            stroke={isSelected ? SELECTION_COLOR : resolveColor(node.style?.borderColor, document!, "#DDDDDD")}
            strokeWidth={node.style?.borderWidth ?? 1}
          />
        );

      default:
        return null;
    }
  }

  return (
    <Stage
      width={1200}
      height={800}
      onMouseDown={(e) => {
        // clic en el fondo del Stage (no sobre un nodo) limpia la selección
        if (e.target === e.target.getStage() && !previewMode) clearSelection();
      }}
    >
      <Layer>{renderNode(screen.root)}</Layer>
    </Stage>
  );
}

function defaultSizeFor(type: DesignNode["type"]): { width: number; height: number } {
  switch (type) {
    case "frame": return { width: 400, height: 600 };
    case "stack": return { width: 300, height: 100 };
    case "button": return { width: 120, height: 40 };
    case "input": return { width: 200, height: 36 };
    case "image": return { width: 120, height: 90 };
    case "icon": return { width: 24, height: 24 };
    case "divider": return { width: 200, height: 1 };
    case "text": return { width: 100, height: 20 };
    default: return { width: 100, height: 40 };
  }
}
