import React from "react";
import { Socket } from "socket.io-client";
import { LineConfig } from "konva/lib/shapes/Line";
import { Group, Image, Line } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { CanvasElement } from "../store/types/canvas";
import useImage from "use-image";
import { renderElementToBitmap } from "../lib/renderElementToBitmap";
import { useCanvasStore } from "../store/canvas";
import { saveStateForUndo } from "../lib/utils/canvas";
type Point = [number, number];

interface Props {
  el: Extract<CanvasElement, { type: "line" }>;
  draggable: boolean;
  updatePosition: (roomId: string, id: string, pos: Point) => void;
  roomId: string;
  socket: Socket;
  style: Partial<LineConfig>;
}

export const DraggableLine: React.FC<Props> = ({
  el,
  draggable,
  updatePosition,
  roomId,
  socket,
  style,
}) => {
  const [fixedBitmap, setFixedBitmap] = React.useState<null | {
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>(null);

  React.useEffect(() => {
    if (el.mask && el.mask.lines.length > 0) {
      setFixedBitmap(renderElementToBitmap(el, el.mask.lines));
    } else {
      setFixedBitmap(null);
    }
  }, [
    // реагируем и на саму маску
    el.mask?.lines.length,
    // и на изменение координат фигуры
    el.points[0][0],
    el.points[0][1],
  ]);

  const [img] = useImage(fixedBitmap?.src || "");

  // Абсолютная позиция первой точки
  const [offsetX, offsetY] = el.points[0];
  const relativePoints = el.points.map(([x, y]) => [x - offsetX, y - offsetY]);
  const flatPoints = relativePoints.flat();

  const get = useCanvasStore.getState;
  const set = useCanvasStore.setState;

  return (
    <Group
      id={el.id}
      x={fixedBitmap ? el.points[0][0] : offsetX}
      y={fixedBitmap ? el.points[0][1] : offsetY}
      draggable={draggable}
      onDragStart={() => {
        saveStateForUndo(roomId, get, set);
        socket.emit("update-undoStack", { roomId });
      }}
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
        if (stage && draggable) {
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
          x={fixedBitmap.x - el.points[0][0]}
          y={fixedBitmap.y - el.points[0][1]}
          width={fixedBitmap.width}
          height={fixedBitmap.height}
          opacity={1} // чтобы после enderElementToBitmap не установилась двойная opacity
        />
      ) : (
        // Если нет маски, обычная Line
        <Line id={el.id} points={flatPoints} {...style} />
      )}
    </Group>
  );
};
