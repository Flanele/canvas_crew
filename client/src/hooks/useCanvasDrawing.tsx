import React from "react";
import { useCanvasStore } from "../store/canvas";
import { nanoid } from "nanoid";
import socket from "../socket/socket";
import Konva from "konva";
import { hitTestLine } from "../lib/hitTestLine";
import { Point } from "../store/types/canvas";
import {
  useApplyMaskToElement,
  useColor,
  useOpacity,
  useStartElement,
  useStrokeColor,
  useStrokeWidth,
  useTool,
  useUpdateElement,
} from "../store/selectors/canvasSelectors";

interface ReturnProps {
  handleMouseDown: () => void;
  handleMouseMove: () => void;
  handleMouseUp: () => void;
}

interface UseCanvasDrawingArgs {
  roomId: string;
  scale: number;
  stageRef: React.RefObject<Konva.Stage | null>;
  drawingIdRef: React.RefObject<string | null>;
  eraserLinesRef: React.RefObject<Point[][]>;
  eraserStrokeWidthsRef: React.RefObject<number[]>;
  targetElementIdRef: React.RefObject<string | null>;
  isDrawing: React.RefObject<boolean>;
  showTextarea: boolean;
  handleStartText: (x: number, y: number) => void;
}

export const useCanvasDrawing = ({
  roomId,
  scale,
  stageRef,
  drawingIdRef,
  eraserLinesRef,
  eraserStrokeWidthsRef,
  targetElementIdRef,
  isDrawing,
  showTextarea,
  handleStartText,
}: UseCanvasDrawingArgs): ReturnProps => {
  const color = useColor();
  const strokeColor = useStrokeColor();
  const strokeWidth = useStrokeWidth();
  const opacity = useOpacity();
  const tool = useTool();

  const startElement = useStartElement();
  const updateElement = useUpdateElement();
  const applyMaskToElement = useApplyMaskToElement();

  const handleMouseDown = () => {
    if (showTextarea) return;
    if (tool === "Select") return;

    const stage = stageRef.current;
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const x = pos.x / scale;
    const y = pos.y / scale;
    const id = nanoid();
    drawingIdRef.current = id;

    const finalStrokeColor = strokeColor || color;
    const elements = useCanvasStore.getState().canvases[roomId] || [];

    if (tool === "Text") {
      handleStartText(x, y);
    }

    // остальные фигуры
    isDrawing.current = true;

    if (tool === "Eraser") {
      eraserLinesRef.current = [[[x, y]]];
      eraserStrokeWidthsRef.current = [strokeWidth];

      // Определяем фигуру под указателем
      const shape = stage.getIntersection(pos);
      if (shape) {
        const elementId = shape.id();
        targetElementIdRef.current = elementId;
      } else {
        // Ручная проверка линий:
        for (const el of elements) {
          if (el.type === "line") {
            if (hitTestLine([x, y], el.points, Math.max(10, el.strokeWidth))) {
              targetElementIdRef.current = el.id;
              break;
            }
          }
        }
      }
    }

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
    if (tool === "Select") return;

    const stage = stageRef.current;
    const pos = stage?.getPointerPosition();
    if (!stage || !pos || !drawingIdRef.current) return;

    const x = pos.x / scale;
    const y = pos.y / scale;

    console.log("DEBUG:");
    console.log("tool:", tool);
    console.log("targetElementIdRef:", targetElementIdRef.current);
    console.log("eraserLinesRef:", eraserLinesRef.current);

    if (tool === "Eraser" && eraserLinesRef.current.length > 0) {
      eraserLinesRef.current[eraserLinesRef.current.length - 1].push([x, y]);
    }

    updateElement(roomId, drawingIdRef.current, [x, y]);

    socket.emit("draw-line", {
      roomId,
      id: drawingIdRef.current,
      point: [x, y],
    });
  };

  const handleMouseUp = React.useCallback(() => {
    if (
      tool === "Eraser" &&
      targetElementIdRef.current &&
      eraserLinesRef.current.length > 0
    ) {
      console.log(
        ">> APPLYING MASK",
        targetElementIdRef.current,
        eraserLinesRef.current
      );
      applyMaskToElement(
        roomId,
        targetElementIdRef.current,
        eraserLinesRef.current,
        eraserStrokeWidthsRef?.current
      );
      socket.emit("apply-mask", {
        roomId,
        elementId: targetElementIdRef.current,
        eraserLines: eraserLinesRef.current,
        strokeWidths: eraserStrokeWidthsRef.current,
      });

      eraserLinesRef.current = [];
      targetElementIdRef.current = null;
    }

    isDrawing.current = false;
    drawingIdRef.current = null;
  }, [tool, roomId, applyMaskToElement]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
