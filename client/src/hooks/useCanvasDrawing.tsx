import React from "react";
import { useCanvasStore } from "../store/canvas";
import { nanoid } from "nanoid";
import socket from "../socket/socket";
import Konva from "konva";
import { Point } from "../store/types/canvas";
import {
  useApplyMaskToElement,
  useColor,
  useOpacity,
  useRemoveElement,
  useStartElement,
  useStrokeColor,
  useStrokeWidth,
  useTool,
  useUpdateElement,
} from "../store/selectors/canvasSelectors";
import { hitTestEraser } from "../lib/hitTestEraser";

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
  const removeElement = useRemoveElement();

  const targetElementIdsRef = React.useRef<string[]>([]);

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
    targetElementIdsRef.current = [];

    const finalStrokeColor = strokeColor || color;
    const isTemp = tool === "Eraser";

    if (tool === "Text") {
      handleStartText(x, y);
    }

    // остальные фигуры
    isDrawing.current = true;

    if (tool === "Eraser") {
      eraserLinesRef.current = [[[x, y]]];
      eraserStrokeWidthsRef.current = [strokeWidth];
    }

    startElement(roomId, [x, y], {
      id,
      color,
      strokeColor: finalStrokeColor,
      strokeWidth,
      opacity,
      tool,
      ...(isTemp ? { isTemp: true } : {}),
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
      ...(isTemp ? { isTemp: true } : {}),
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
  
    if (tool === "Eraser" && eraserLinesRef.current.length > 0) {
      eraserLinesRef.current[eraserLinesRef.current.length - 1].push([x, y]);
      
      // Проверяем, какие элементы задеты ластиком
      const elements = useCanvasStore.getState().canvases[roomId] || [];
      const eraserPoints = eraserLinesRef.current.flat(); // все точки текущей линии ластика
  
      elements.forEach((el) => {
        // Не добавляем временные линии и уже отмеченные элементы
        if (el.type === 'line' && el.isTemp) return;
        if (targetElementIdsRef.current.includes(el.id)) return;
  
        if (hitTestEraser(eraserPoints, el)) {
          targetElementIdsRef.current.push(el.id);
        }
      });
    }
  
    updateElement(roomId, drawingIdRef.current, [x, y]);
  
    socket.emit("draw-line", {
      roomId,
      id: drawingIdRef.current,
      point: [x, y],
    });
  };
  

  const handleMouseUp = React.useCallback(() => {
    let tempLineId = drawingIdRef.current;
  
    if (tool === "Eraser" && eraserLinesRef.current.length > 0) {
      // Применяем маску ко всем задетым элементам
      for (const targetId of targetElementIdsRef.current) {
        applyMaskToElement(
          roomId,
          targetId,
          eraserLinesRef.current,
          eraserStrokeWidthsRef?.current
        );
        socket.emit("apply-mask", {
          roomId,
          elementId: targetId,
          eraserLines: eraserLinesRef.current,
          strokeWidths: eraserStrokeWidthsRef.current,
        });
      }
  
      if (tempLineId) {
        removeElement(roomId, tempLineId);
        socket.emit("remove-element", {
          roomId,
          id: tempLineId,
        });
      }
  
      eraserLinesRef.current = [];
      targetElementIdsRef.current = [];
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
