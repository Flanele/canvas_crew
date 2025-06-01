import { Group } from "react-konva";
import { CanvasElement } from "../../../store/canvas";

type DraggableConfig = {
  tool: string;
  element: CanvasElement;
  children: React.ReactNode;
  onDragMove: (pos: { x: number; y: number }) => void;
};

export const renderDraggable = ({
  tool,
  element,
  children,
  onDragMove,
}: DraggableConfig) => {
  const isDraggable = tool === "Select" && element.tool !== "Eraser";

  if (!isDraggable) return <>{children}</>;

  return (
    <Group
      key={element.id}
      draggable
      onDragMove={(e) => {
        const abs = e.target.getAbsolutePosition(); 
        onDragMove({ x: abs.x, y: abs.y });
        e.target.position({ x: 0, y: 0 });
      }}
      onMouseEnter={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "pointer";
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "default";
      }}
    >
      {children}
    </Group>
  );
};
