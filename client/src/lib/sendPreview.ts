import Konva from "konva";
import { RefObject } from "react";
import socket from "../socket/socket";

export const sendPreview = (
  roomId: string,
  stageRef: RefObject<Konva.Stage | null>
) => {
  if (stageRef.current) {
    const dataUrl = stageRef.current.toDataURL({ pixelRatio: 0.7 });
    socket.emit("update-room-preview", { roomId, preview: dataUrl });
  }
};
