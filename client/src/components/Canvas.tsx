import React, { RefObject } from "react";
import { Stage } from "react-konva";
import Konva from "konva";
import { useZoom } from "../hooks/useZoom";
import { CanvasLayer } from "./CanvasLayer";
import { useTextInput } from "../hooks/useTextInput";
import { TextInputOverlay } from "./TextInputOverlay";
import { useCanvasSocketHandler } from "../hooks/useCanvasSocketHandler";
import { useCanvasDrawing } from "../hooks/useCanvasDrawing";
import { useColor, useOpacity, useStartElement, useStrokeColor, useStrokeWidth, useUpdateTextElement } from "../store/selectors/canvasSelectors";

interface Props {
  roomId: string;
  stageRef: RefObject<Konva.Stage | null>;
}

type Point = [number, number];
export const BASE_WIDTH = 750;

export const Canvas: React.FC<Props> = ({ roomId, stageRef }) => {
  const isDrawing = React.useRef(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const drawingIdRef = React.useRef<string | null>(null);
  const eraserLinesRef = React.useRef<Point[][]>([]);
  const eraserStrokeWidthsRef = React.useRef<number[]>([]);

  const color = useColor();
  const strokeColor = useStrokeColor();
  const strokeWidth = useStrokeWidth();
  const opacity = useOpacity();

  const startElement = useStartElement();
  const updateTextElement = useUpdateTextElement();

  const { scale, handleWheel } = useZoom(stageRef);

  const {
    textareaRef,
    textPos,
    showTextarea,
    handleStartText,
    handleOnTextInput,
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

  const { handleMouseDown, handleMouseMove, handleMouseUp } = useCanvasDrawing({
    roomId,
    scale,
    stageRef,
    drawingIdRef,
    eraserLinesRef,
    eraserStrokeWidthsRef,
    isDrawing,
    showTextarea,
    handleStartText,
  });

  useCanvasSocketHandler(roomId);

  const BASE_HEIGHT = 450;
  const WORKSPACE_WIDTH = 2200;
  const WORKSPACE_HEIGHT = 1400;

  React.useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseUp]);

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
      className="w-full h-[calc(100vh-92px)] bg-bg overflow-auto"
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
              onInput={handleOnTextInput}
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
