import React from "react";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";
import { useZoom } from "../hooks/useZoom";
import { useCanvasStore } from "../store/canvas";
import socket from "../socket/socket";

interface Props {
  roomId: string;
}

export const Canvas: React.FC<Props> = ({ roomId }) => {
  const isDrawing = React.useRef(false);
  const stageRef = React.useRef<Konva.Stage>(null);
  const containerRef = React.useRef<HTMLDivElement>(null); // scrollable container
  const color = useCanvasStore((state) => state.color);
  const strokeWidth = useCanvasStore((state) => state.strokeWidth);
  const opacity = useCanvasStore((state) => state.opacity);

  const lines =
    useCanvasStore(
      React.useCallback((state) => state.canvases[roomId], [roomId])
    ) || [];

  const startLine = useCanvasStore((state) => state.startLine);
  const updateLine = useCanvasStore((state) => state.updateLine);

  const { scale, handleWheel } = useZoom(stageRef);

  const BASE_WIDTH = 750;
  const BASE_HEIGHT = 450;
  const WORKSPACE_WIDTH = 2200;
  const WORKSPACE_HEIGHT = 1400;

  React.useEffect(() => {
    const handleStart = ({
      roomId: incomingRoomId,
      point,
      color: incomingColor,
      strokeWidth: incomingStrokeWidth,
      opacity: incomingOpacity
    }: {
      roomId: string;
      point: [number, number];
      color: string,
      strokeWidth: number,
      opacity: number
    }) => {
      if (incomingRoomId !== roomId) return;
      startLine(incomingRoomId, point, incomingColor, incomingStrokeWidth, incomingOpacity);
    };

    const handleMove = ({
      roomId: incomingRoomId,
      point,
    }: {
      roomId: string;
      point: [number, number];
    }) => {
      if (incomingRoomId !== roomId) return;
      updateLine(incomingRoomId, point);
    };

    socket.on("start-line", handleStart);
    socket.on("draw-line", handleMove);

    return () => {
      socket.off("start-line", handleStart);
      socket.off("draw-line", handleMove);
    };
  }, [roomId]);

  const handleMouseDown = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const x = pos.x / scale;
    const y = pos.y / scale;

    isDrawing.current = true;
    startLine(roomId, [x, y]);

    socket.emit("start-line", { roomId, point: [x, y], color, strokeWidth, opacity });
  };

  const handleMouseMove = () => {
    if (!isDrawing.current) return;
    const stage = stageRef.current;
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const x = pos.x / scale;
    const y = pos.y / scale;

    updateLine(roomId, [x, y]);

    socket.emit("draw-line", { roomId, point: [x, y] });
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  React.useEffect(() => {
    const handleMouseUp = () => {
      isDrawing.current = false;
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  // Scroll to center on mount
  React.useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollLeft = (WORKSPACE_WIDTH - container.clientWidth) / 2;
      container.scrollTop = (WORKSPACE_HEIGHT - container.clientHeight) / 2;
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-[calc(100vh-62px)] bg-bg overflow-auto"
    >
      <div
        className="relative"
        style={{
          width: WORKSPACE_WIDTH,
          height: WORKSPACE_HEIGHT,
        }}
      >
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white"
          style={{
            width: BASE_WIDTH * scale,
            height: BASE_HEIGHT * scale,
          }}
        >
          <Stage
            ref={stageRef}
            width={BASE_WIDTH * scale}
            height={BASE_HEIGHT * scale}
            scale={{ x: scale, y: scale }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
          >
            <Layer>
              {lines.map((line, i) => (
                <Line
                key={i}
                points={line.points.flat()}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
                opacity={line.opacity}
                tension={0}
                lineCap="round"
                lineJoin="round"
              />
              ))}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
};
