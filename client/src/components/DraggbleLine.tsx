import { Socket } from "socket.io-client";
import { CanvasElement } from "../store/canvas";
import { LineConfig } from "konva/lib/shapes/Line";
import { Group, Line } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
type Point = [number, number];

interface Props {
  el: Extract<CanvasElement, { type: "line" }>;
  tool: string;
  updatePosition: (roomId: string, id: string, pos: Point) => void;
  roomId: string;
  socket: Socket;
  style: Partial<LineConfig>;
}

export const DraggableLine: React.FC<Props> = ({
  el,
  tool,
  updatePosition,
  roomId,
  socket,
  style,
}) => {
  const isDraggable = tool === "Select" && el.tool !== "Eraser";

  // Абсолютная позиция первой точки
  const [offsetX, offsetY] = el.points[0];

  // Относительные точки — Line будет рисоваться от (0,0)
  const relativePoints = el.points.map(([x, y]) => [x - offsetX, y - offsetY]);
  const flatPoints = relativePoints.flat();

  return (
    <Group
      id={el.id}
      x={offsetX}
      y={offsetY}
      draggable={isDraggable}
      onDragMove={(e: KonvaEventObject<DragEvent>) => {
        const { x, y } = e.target.position();
        updatePosition(roomId, el.id, [x, y]);
        socket.emit("move-element", {
          roomId,
          id: el.id,
          point: [x, y],
        });
      }}
      onMouseEnter={(e) => {
        const stage = e.target.getStage();
        if (stage && isDraggable) {
          stage.container().style.cursor = "pointer";
        }
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        if (stage) {
          stage.container().style.cursor = "default";
        }
      }}
    >
      {/* Основная линия */}
      <Line id={el.id} points={flatPoints} {...style} />

      {/* Маска-ластик для линии */}
      {el.mask?.lines.map((line, idx) => (
        <Line
          key={`mask-${idx}`}
          points={line
            .map(([x, y]) => [x - offsetX, y - offsetY]) // делаем их локальными относительно группы!
            .flat()}
          stroke="red"
          strokeWidth={el.strokeWidth}
          globalCompositeOperation="destination-out"
          lineCap="round"
          lineJoin="round"
        />
      ))}
    </Group>
  );
};
