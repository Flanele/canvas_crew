import { KonvaEventObject } from "konva/lib/Node";
import { Group, Line } from "react-konva";
import { Socket } from "socket.io-client";
import { Mask } from "../store/types/canvas";

type Point = [number, number];

interface Props {
  id: string;
  mask?: Mask;
  position: Point;
  tool: string;
  draggable: boolean;
  updatePosition: (roomId: string, id: string, pos: Point) => void;
  roomId: string;
  socket: Socket;
  children: React.ReactNode;
}

export const MaskedDraggableGroup: React.FC<Props> = ({
  id,
  mask,
  position,
  tool,
  draggable,
  updatePosition,
  roomId,
  socket,
  children,
}) => {
  const [x, y] = position;

  return (
    <Group
      x={x}
      y={y}
      draggable={draggable}
      onDragMove={(e: KonvaEventObject<DragEvent>) => {
        const newPos = e.target.position();
        updatePosition(roomId, id, [newPos.x, newPos.y]);
        socket.emit("move-element", {
          roomId,
          id,
          point: [newPos.x, newPos.y],
        });
      }}
      onMouseEnter={(e) => {
        const stage = e.target.getStage();
        if (stage && draggable) stage.container().style.cursor = "pointer";
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "default";
      }}
    >
      {/* Основная фигура */}
      {children}

      {/* Маска-ластик */}
      {mask?.lines.map((line, idx) => (
        <Line
          key={`mask-${idx}`}
          points={line.points.flat()}
          stroke="red"
          strokeWidth={line.strokeWidth}
          opacity={1}
          globalCompositeOperation="destination-out"
          lineCap="round"
          lineJoin="round"
        />
      ))}
    </Group>
  );
};
