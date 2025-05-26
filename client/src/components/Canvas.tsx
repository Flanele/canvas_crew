import React from "react";
import { Stage } from "react-konva";
import Konva from "konva";
import { useZoom } from "../hooks/useZoom";
import { Tool, useCanvasStore } from "../store/canvas";
import socket from "../socket/socket";
import { CanvasLayer } from "./CanvasLayer";
import { nanoid } from "nanoid";

interface Props {
  roomId: string;
}

export const Canvas: React.FC<Props> = ({ roomId }) => {
  const isDrawing = React.useRef(false);
  const stageRef = React.useRef<Konva.Stage>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const [textPos, setTextPos] = React.useState<{ x: number; y: number } | null>(
    null
  );
  const [showTextarea, setShowTextarea] = React.useState(false);

  const color = useCanvasStore((s) => s.color);
  const strokeColor = useCanvasStore((s) => s.strokeColor);
  const strokeWidth = useCanvasStore((s) => s.strokeWidth);
  const opacity = useCanvasStore((s) => s.opacity);
  const tool = useCanvasStore((s) => s.tool);

  const startElement = useCanvasStore((s) => s.startElement);
  const updateElement = useCanvasStore((s) => s.updateElement);

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

    socket.on("start-line", handleStart);
    socket.on("draw-line", handleMove);

    return () => {
      socket.off("start-line", handleStart);
      socket.off("draw-line", handleMove);
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
      setTextPos({ x, y });
      setShowTextarea(true);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
      return;
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

  const handleTextSubmit = () => {
    const value = textareaRef.current?.value.trim();
    if (!value || !textPos) return;

    const id = nanoid();
    const finalStrokeColor = strokeColor || color;

    startElement(roomId, [textPos.x, textPos.y], {
      id,
      color,
      strokeColor: finalStrokeColor,
      strokeWidth,
      opacity,
      tool: "Text",
      text: value,
    });

    socket.emit("start-line", {
      roomId,
      id,
      point: [textPos.x, textPos.y],
      color,
      strokeColor: finalStrokeColor,
      strokeWidth,
      opacity,
      tool: "Text",
      text: value,
    });

    setShowTextarea(false);
    setTextPos(null);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleTextSubmit();
      } else if (e.key === "Escape") {
        setShowTextarea(false);
        setTextPos(null);
      }
    };
    if (showTextarea) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showTextarea, textPos]);

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
            <textarea
            ref={textareaRef}
            className={`
              absolute z-20
              resize-none overflow-hidden
              bg-transparent border-none outline-none
              p-0 m-0 leading-none
            `}
            style={{
              top: `${textPos.y * scale}px`,
              left: `${textPos.x * scale}px`,
              fontSize: `${strokeWidth * 4 * scale}px`,
              color: color,
              WebkitTextStroke: strokeColor ? `1px ${strokeColor}` : undefined,
            }}
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
