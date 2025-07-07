import { KonvaEventObject } from "konva/lib/Node";
import { Group, Image } from "react-konva";
import { Socket } from "socket.io-client";
import { CanvasElement, Mask } from "../store/types/canvas";
import React from "react";
import {
  BitmapResult,
  renderElementToBitmap,
} from "../lib/renderElementToBitmap";
import useImage from "use-image";
import { useCanvasStore } from "../store/canvas";
import { saveStateForUndo } from "../lib/utils/canvas";

type Point = [number, number];

interface Props {
  id: string;
  el: CanvasElement;
  mask?: Mask;
  position: Point;
  draggable: boolean;
  updatePosition: (roomId: string, id: string, pos: Point) => void;
  roomId: string;
  socket: Socket;
  children: React.ReactNode;
}

export const MaskedDraggableGroup: React.FC<Props> = ({
  id,
  el,
  mask,
  position,
  draggable,
  updatePosition,
  roomId,
  socket,
  children,
}) => {
  const [x, y] = position;
  const hasMask = mask && mask.lines.length > 0;

  const [fixedBitmap, setFixedBitmap] = React.useState<null | BitmapResult>(
    null
  );

  React.useEffect(() => {
    if (hasMask) {
      setFixedBitmap(renderElementToBitmap(el, mask!.lines));
    } else {
      setFixedBitmap(null);
    }
  }, [hasMask, mask?.lines.length, position[0], position[1]]);

  const [img] = useImage(fixedBitmap?.src || "");

  const get = useCanvasStore.getState;
  const set = useCanvasStore.setState;

  return (
    <Group
      x={x}
      y={y}
      draggable={draggable}
      onDragStart={() => {
        saveStateForUndo(roomId, get, set);
        socket.emit("update-undoStack", { roomId });
      }}
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
      {/* Если есть маска — показываем bitmap */}
      {fixedBitmap ? (
        <Image
          key={fixedBitmap.src}
          image={img}
          x={fixedBitmap.x - position[0]}
          y={fixedBitmap.y - position[1]}
          width={fixedBitmap.width}
          height={fixedBitmap.height}
          opacity={1}
        />
      ) : (
        children
      )}
    </Group>
  );
};
