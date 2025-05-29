import React from "react";
import { Stage } from "react-konva";
import Konva from "konva";
import { useZoom } from "../hooks/useZoom";
import { Tool, useCanvasStore } from "../store/canvas";
import socket from "../socket/socket";
import { CanvasLayer } from "./CanvasLayer";
import { nanoid } from "nanoid";
import { useTextInput } from "../hooks/useTextInput";
import { TextInputOverlay } from "./TextInputOverlay";

interface Props {
  roomId: string;
}

export const Canvas: React.FC<Props> = ({ roomId }) => {
  const isDrawing = React.useRef(false);
  const stageRef = React.useRef<Konva.Stage>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const color = useCanvasStore((s) => s.color);
  const strokeColor = useCanvasStore((s) => s.strokeColor);
  const strokeWidth = useCanvasStore((s) => s.strokeWidth);
  const opacity = useCanvasStore((s) => s.opacity);
  const tool = useCanvasStore((s) => s.tool);

  const startElement = useCanvasStore((s) => s.startElement);
  const updateTextElement = useCanvasStore((s) => s.updateTextElement);
  const updateElement = useCanvasStore((s) => s.updateElement);
  const {
    textareaRef,
    textPos,
    showTextarea,
    handleStartText,
    handleOnTextChange,
    handleTextSubmit,
    setShowTextarea,
    setTextPos,
  } = useTextInput({
    roomId,
    color,
    strokeColor,
    strokeWidth,
    opacity,
    startElement,
    updateTextElement,
  });

  const { scale, handleWheel } = useZoom(stageRef);

  const BASE_WIDTH = 750;
  const BASE_HEIGHT = 450;
  const WORKSPACE_WIDTH = 2200;
  const WORKSPACE_HEIGHT = 1400;

  React.useEffect(() => {
    const handleStart = ({
      roomId: incomingRoomId,
      point,
      id,
      color,
      strokeColor,
      strokeWidth,
      opacity,
      tool,
      text,
    }: {
      roomId: string;
      point: [number, number];
      id: string;
      color?: string;
      strokeColor?: string;
      strokeWidth?: number;
      opacity?: number;
      tool?: Tool;
      text?: string;
    }) => {
      if (incomingRoomId !== roomId) return;
      startElement(incomingRoomId, point, {
        id,
        color,
        strokeColor,
        strokeWidth,
        opacity,
        tool,
        text,
      });
    };

    const handleMove = ({
      roomId: incomingRoomId,
      point,
    }: {
      roomId: string;
      point: [number, number];
    }) => {
      if (incomingRoomId !== roomId) return;
      updateElement(incomingRoomId, point);
    };

    const handleTextChange = ({ roomId: incomingRoomId, id, text }: { roomId: string; id: string; text: string }) => {
      if (incomingRoomId !== roomId) return;
      updateTextElement(incomingRoomId, id, text);
    };

    socket.on("start-line", handleStart);
    socket.on("draw-line", handleMove);
    socket.on("text-change", handleTextChange);

    return () => {
      socket.off("start-line", handleStart);
      socket.off("draw-line", handleMove);
      socket.off("text-change", handleTextChange);
    };
  }, [roomId]);

  const handleMouseDown = () => {
    if (showTextarea) return;

    const stage = stageRef.current;
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const x = pos.x / scale;
    const y = pos.y / scale;
    const id = nanoid();
    const finalStrokeColor = strokeColor || color;

    if (tool === "Text") {
      handleStartText(x, y);
    }

    // остальные фигуры
    isDrawing.current = true;

    startElement(roomId, [x, y], {
      id,
      color,
      strokeColor: finalStrokeColor,
      strokeWidth,
      opacity,
      tool,
    });

    socket.emit("start-line", {
      roomId,
      id,
      point: [x, y],
      color,
      strokeColor: finalStrokeColor,
      strokeWidth,
      opacity,
      tool,
    });
  };

  const handleMouseMove = () => {
    if (!isDrawing.current) return;

    const stage = stageRef.current;
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const x = pos.x / scale;
    const y = pos.y / scale;

    updateElement(roomId, [x, y]);

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
        style={{ width: WORKSPACE_WIDTH, height: WORKSPACE_HEIGHT }}
      >
        <div
          className="absolute top-1/2 left-1/2 bg-white -translate-x-1/2 -translate-y-1/2"
          style={{ width: BASE_WIDTH * scale, height: BASE_HEIGHT * scale }}
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
            <CanvasLayer roomId={roomId} />
          </Stage>

          {showTextarea && textPos && (
            <TextInputOverlay
              textareaRef={textareaRef}
              x={textPos.x}
              y={textPos.y}
              scale={scale}
              strokeWidth={strokeWidth}
              color={color}
              strokeColor={strokeColor}
              onChange={handleOnTextChange}
              onBlur={() => {
                handleTextSubmit();
                setShowTextarea(false);
                setTextPos(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
