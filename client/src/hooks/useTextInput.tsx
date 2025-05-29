import { nanoid } from "nanoid";
import React from "react";
import socket from "../socket/socket";

export const useTextInput = ({
  roomId,
  color,
  strokeColor,
  strokeWidth,
  opacity,
  startElement,
  updateTextElement,
}: {
  roomId: string;
  color: string;
  strokeColor?: string;
  strokeWidth: number;
  opacity: number;
  startElement: Function;
  updateTextElement: Function;
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [textPos, setTextPos] = React.useState<{ x: number; y: number } | null>(
    null
  );
  const [showTextarea, setShowTextarea] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const handleStartText = (x: number, y: number) => {
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
  };

  const handleTextSubmit = () => {
    const value = textareaRef.current?.value.trim();
    if (!value || !textPos) return;

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

  const handleOnTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
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
    handleOnTextChange,
    handleTextSubmit,
    setShowTextarea,
    setTextPos,
  };
};
