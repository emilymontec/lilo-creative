import { Stage, Layer } from "react-konva";
import { useDesignStore } from "../store/designStore";

/**
 * Renderiza la pantalla activa (`currentScreen()`) del DesignDocument como
 * elementos Konva interactivos. Cambiar de pantalla (ScreensTabs) solo
 * cambia qué árbol se renderiza aquí — el documento completo permanece en
 * memoria en el store.
 * TODO: mapear cada DesignNode (frame/stack/text/button/image/input/icon/divider)
 * a su primitiva de Konva correspondiente, de forma recursiva.
 */
export function CanvasRenderer() {
  const screen = useDesignStore((s) => s.currentScreen());

  return (
    <Stage width={1200} height={800}>
      <Layer>{/* TODO: render recursivo de screen?.root */}</Layer>
    </Stage>
  );
}
