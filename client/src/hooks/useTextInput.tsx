import { nanoid } from "nanoid";
import React from "react";
import socket from "../socket/socket";
import { Tool } from "../store/types/canvas";

type StartElementFn = (
  roomId: string,
  point: [number, number],
  options: {
    id?: string;
    color?: string;
    strokeColor?: string;
    strokeWidth?: number;
    opacity?: number;
    tool?: Tool;
    text?: string;
  }
) => void;

type UpdateTextElementFn = (
  roomId: string,
  id: string,
  newText: string
) => void;

export interface UseTextInputProps {
  roomId: string;
  color: string;
  strokeColor?: string;
  strokeWidth: number;
  opacity: number;
  startElement: StartElementFn;
  updateTextElement: UpdateTextElementFn;
}

// Типы для возвращаемых значений
export interface TextPos {
  x: number;
  y: number;
}

export interface UseTextInputReturn {
  textareaRef: React.RefObject<HTMLDivElement | null>;
  textPos: TextPos | null;
  showTextarea: boolean;
  handleStartText: (x: number, y: number) => void;
  handleOnTextInput: (e: React.FormEvent<HTMLDivElement>) => void;
  handleTextSubmit: () => void;
  setShowTextarea: React.Dispatch<React.SetStateAction<boolean>>;
  setTextPos: React.Dispatch<React.SetStateAction<TextPos | null>>;
}

export const useTextInput = ({
  roomId,
  color,
  strokeColor,
  strokeWidth,
  opacity,
  startElement,
  updateTextElement,
}: UseTextInputProps): UseTextInputReturn => {
  const textareaRef = React.useRef<HTMLDivElement>(null);

  const [textPos, setTextPos] = React.useState<{ x: number; y: number } | null>(
    null
  );
  const [showTextarea, setShowTextarea] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const handleStartText = React.useCallback(
    (x: number, y: number) => {
      const id = nanoid();
      setEditingId(id);
      setTextPos({ x, y });
      setShowTextarea(true);

      const finalStrokeColor = strokeColor || color;
      startElement(roomId, [x, y], {
        id,
        color,
        strokeColor: finalStrokeColor,
        strokeWidth,
        opacity,
        tool: "Text",
        text: "",
      });

      socket.emit("start-line", {
        roomId,
        id,
        point: [x, y],
        color,
        strokeColor: finalStrokeColor,
        strokeWidth,
        opacity,
        tool: "Text",
        text: "",
      });

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    },
    [
      roomId,
      color,
      strokeColor,
      strokeWidth,
      opacity,
      startElement,
      updateTextElement,
    ]
  );

  const handleTextSubmit = () => {
    const value = textareaRef.current?.innerText.trim();
    if (!value || !textPos || !editingId) return;

    updateTextElement(roomId, editingId, value);

    socket.emit("text-change", {
      roomId,
      id: editingId,
      text: value,
    });

    setShowTextarea(false);
    setTextPos(null);
    setEditingId(null);
  };

  const handleOnTextInput = (e: React.FormEvent<HTMLDivElement>) => {
    const value = (e.currentTarget as HTMLDivElement).innerText;
    if (!editingId) return;

    updateTextElement(roomId, editingId, value);

    socket.emit("text-change", {
      roomId,
      id: editingId,
      text: value,
    });
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

  return {
    textareaRef,
    textPos,
    showTextarea,
    handleStartText,
    handleOnTextInput,
    handleTextSubmit,
    setShowTextarea,
    setTextPos,
  };
};
