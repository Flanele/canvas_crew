import { KonvaEventObject } from "konva/lib/Node";
import { CanvasElement } from "../store/canvas";
import { Socket } from "socket.io-client";

export const makeDraggableProps = ({
    tool,
    element,
    updatePosition,
    roomId,
    socket,
  }: {
    tool: string;
    element: CanvasElement;
    updatePosition: (roomId: string, id: string, pos: [number, number]) => void;
    roomId: string;
    socket: Socket;
  }) => {
    const isDraggable = tool === "Select" && element.tool !== "Eraser";
  
    return {
      draggable: isDraggable,
      onDragMove: (e: KonvaEventObject<DragEvent>) => {
        const { x, y } = e.target.position();
        updatePosition(roomId, element.id, [x, y]);
        socket.emit("move-element", {
          roomId,
          id: element.id,
          point: [x, y],
        });
      },
      onMouseEnter: (e: KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (stage && isDraggable) {
          stage.container().style.cursor = "pointer";
        }
      },
      onMouseLeave: (e: KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (stage) {
          stage.container().style.cursor = "default";
        }
      },
    };
  };