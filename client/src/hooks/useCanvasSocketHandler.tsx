import React from "react";
import socket from "../socket/socket";
import { Point, Tool } from "../store/types/canvas";
import {
  useApplyMaskToElement,
  useRedo,
  useRemoveElement,
  useResetCanvas,
  useStartElement,
  useUndo,
  useUpdateElement,
  useUpdateElementPosition,
  useUpdateTextElement,
} from "../store/selectors/canvasSelectors";
import { useCanvasStore } from "../store/canvas";
import { saveStateForUndo } from "../lib/utils/canvas";

export const useCanvasSocketHandler = (roomId: string) => {
  const startElement = useStartElement();
  const updateTextElement = useUpdateTextElement();
  const updateElement = useUpdateElement();
  const updateElementPosition = useUpdateElementPosition();
  const applyMaskToElement = useApplyMaskToElement();
  const removeElement = useRemoveElement();
  const undo = useUndo();
  const redo = useRedo();
  const reset = useResetCanvas();

  const get = useCanvasStore.getState;
  const set = useCanvasStore.setState;

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
      id,
      point,
    }: {
      roomId: string;
      id: string;
      point: [number, number];
    }) => {
      if (incomingRoomId !== roomId) return;
      updateElement(incomingRoomId, id, point);
    };

    const handleTextChange = ({
      roomId: incomingRoomId,
      id,
      text,
    }: {
      roomId: string;
      id: string;
      text: string;
    }) => {
      if (incomingRoomId !== roomId) return;
      updateTextElement(incomingRoomId, id, text);
    };

    const handleMoveElement = ({
      roomId: incomingRoomId,
      id,
      point,
    }: {
      roomId: string;
      id: string;
      point: [number, number];
    }) => {
      if (incomingRoomId !== roomId) return;
      updateElementPosition(roomId, id, point);
    };

    const handleApplyMask = ({
      roomId: incomingRoomId,
      elementId,
      eraserLines,
      strokeWidths,
      tempLineId,
    }: {
      roomId: string;
      elementId: string;
      eraserLines: Point[][];
      strokeWidths: number[];
      tempLineId: string;
    }) => {
      if (incomingRoomId !== roomId) return;
      applyMaskToElement(roomId, elementId, eraserLines, strokeWidths, tempLineId);
    };

    const handleRemoveElement = ({
      roomId: incomingRoomId,
      elementId,
    }: {
      roomId: string;
      elementId: string;
    }) => {
      if (incomingRoomId !== roomId) return;
      removeElement(roomId, elementId);
    };

    const handleUndo = ({ roomId: incomingRoomId }: { roomId: string }) => {
      if (incomingRoomId !== roomId) return;
      undo(roomId);
    };

    const handleRedo = ({ roomId: incomingRoomId }: { roomId: string }) => {
      if (incomingRoomId !== roomId) return;
      redo(roomId);
    };

    const handleUpdateUndoStack = ({
      roomId: incomingRoomId,
    }: {
      roomId: string;
    }) => {
      if (incomingRoomId !== roomId) return;
      saveStateForUndo(roomId, get, set);
    };

    const handleResetCanvas = ({
      roomId: incomingRoomId,
    }: {
      roomId: string;
    }) => {
      if (incomingRoomId !== roomId) return;
      reset(roomId);
    };

    socket.on("start-line", handleStart);
    socket.on("draw-line", handleMove);
    socket.on("text-change", handleTextChange);
    socket.on("move-element", handleMoveElement);
    socket.on("apply-mask", handleApplyMask);
    socket.on("remove-element", handleRemoveElement);
    socket.on("undo", handleUndo);
    socket.on("redo", handleRedo);
    socket.on("update-undoStack", handleUpdateUndoStack);
    socket.on("reset-canvas", handleResetCanvas);

    return () => {
      socket.off("start-line", handleStart);
      socket.off("draw-line", handleMove);
      socket.off("text-change", handleTextChange);
      socket.off("move-element", handleMoveElement);
      socket.off("apply-mask", handleApplyMask);
      socket.off("remove-element", handleRemoveElement);
      socket.off("undo", handleUndo);
      socket.off("redo", handleRedo);
      socket.off("update-undoStack", handleUpdateUndoStack);
      socket.off("reset-canvas", handleResetCanvas);
    };
  }, [roomId]);
};
