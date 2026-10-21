import { Stage, Layer } from "react-konva";
import { useDesignStore } from "../store/designStore";

/**
 * Renderiza el DesignTree actual como elementos Konva interactivos.
 * TODO: mapear cada DesignNode (frame/text/button/image/stack) a su
 * primitiva de Konva correspondiente, de forma recursiva.
 */
export function CanvasRenderer() {
  const tree = useDesignStore((s) => s.tree);

  return (
    <Stage width={1200} height={800}>
      <Layer>{/* TODO: render recursivo de tree?.root */}</Layer>
    </Stage>
  );
}
