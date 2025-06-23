import React from "react";
import { Socket } from "socket.io-client";
import { LineConfig } from "konva/lib/shapes/Line";
import { Group, Image, Line } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { CanvasElement } from "../store/types/canvas";
import useImage from "use-image";
import { renderElementToBitmap } from "../lib/renderElementToBitman";
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
  const [fixedBitmap, setFixedBitmap] = React.useState<null | {
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>(null);

  React.useEffect(() => {
    console.log('line points:', el.points);


    if (el.mask && el.mask.lines.length > 0) {
      setFixedBitmap(renderElementToBitmap(el, el.mask.lines));
    } else {
      setFixedBitmap(null);
    }
    // Подписка только на mask (а не на весь el)
  }, [el.mask?.lines.length]);
  const [img] = useImage(fixedBitmap?.src || "");

  const relativePoints = el.points.map(([x, y]) => [x - offsetX, y - offsetY]);
  const flatPoints = relativePoints.flat();

  return (
    <Group
      id={el.id}
      x={fixedBitmap ? fixedBitmap.x : offsetX}
      y={fixedBitmap ? fixedBitmap.y : offsetY}
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
      {/* Если есть маска, рендерим bitmap */}
      {fixedBitmap ? (
        <Image
          key={fixedBitmap.src}
          image={img}
          x={0}
          y={0}
          width={fixedBitmap.width}
          height={fixedBitmap.height}
          opacity={el.opacity}
        />
      ) : (
        // Если нет маски, обычная Line
        <Line id={el.id} points={flatPoints} {...style} />
      )}
    </Group>
  );
};
