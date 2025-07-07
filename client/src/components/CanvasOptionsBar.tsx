import React, { RefObject } from "react";
import { Save, RotateCcw } from "lucide-react";
import { cn } from "../lib/utils/cn";
import { useResetCanvas } from "../store/selectors/canvasSelectors";
import socket from "../socket/socket";
import Konva from "konva";

interface Props {
  roomId: string;
  stageRef: RefObject<Konva.Stage | null>;
  className?: string;
}

export const CanvasOptionsBar: React.FC<Props> = ({
  roomId,
  stageRef,
  className,
}) => {
  const reset = useResetCanvas();

  const resetCanvasHandler = () => {
    reset(roomId);
    socket.emit("reset-canvas", { roomId: roomId });
  };

  const saveCanvas = () => {
    if (!stageRef.current) return;

    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });

    const link = document.createElement("a");
    link.download = `canvas-${roomId}.png`;
    link.href = dataURL;
    link.click();
  };

  return (
    <div className={cn("border-b-1 border-border", className)}>
      <div className="flex gap-6 p-1 pl-3">
        <button
          className="flex items-center gap-1 cursor-pointer text-gray-700 hover:text-black transition text-[14px]"
          onClick={saveCanvas}
        >
          <Save size={16} className="mr-1" />
          Save
        </button>
        <button
          className="flex items-center gap-1 cursor-pointer text-gray-700 hover:text-black transition text-[14px]"
          onClick={resetCanvasHandler}
        >
          <RotateCcw size={16} className="mr-1" />
          Reset canvas
        </button>
      </div>
    </div>
  );
};
