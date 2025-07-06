import { create } from "zustand";
import { nanoid } from "nanoid";
import { CanvasElement, Point, RoomId, Tool } from "./types/canvas";
import {
  applyMaskHelper,
  saveStateForUndo,
  updateElementPositionHelper,
} from "../lib/utils/canvas";

export interface CanvasStore {
  canvases: Record<RoomId, CanvasElement[]>;
  undoStack: Record<RoomId, CanvasElement[][]>;
  redoStack: Record<RoomId, CanvasElement[][]>;
  color: string;
  strokeColor: string | undefined;
  strokeWidth: number;
  opacity: number;
  tool: Tool;
  text: string;
  selectedElementId: string | null;

  setColor: (color: string) => void;
  setStrokeColor: (strokeColor: string) => void;
  setStrokeWidth: (strokeWidth: number) => void;
  setOpacity: (opacity: number) => void;
  setTool: (tool: Tool) => void;
  setText: (text: string) => void;
  setSelectedElement: (id: string | null) => void;

  startElement: (
    roomId: RoomId,
    point: Point,
    options?: {
      id?: string;
      color?: string;
      strokeColor?: string;
      strokeWidth?: number;
      opacity?: number;
      tool?: Tool;
      text?: string;
      isTemp?: boolean;
    }
  ) => void;

  updateElement: (roomId: RoomId, id: string, point: Point) => void;
  updateTextElement: (roomId: RoomId, id: string, text: string) => void;
  updateElementPosition: (roomId: RoomId, id: string, pos: Point) => void;
  applyMaskToElement: (
    roomId: RoomId,
    elementId: string,
    eraserLines: Point[][],
    strokeWidths: number[]
  ) => void;
  removeElement: (roomId: RoomId, id: string) => void;

  undo: (roomId: RoomId) => void;
  redo: (roomId: RoomId) => void;

  resetCanvas: (roomId: RoomId) => void;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  canvases: {},
  undoStack: {},
  redoStack: {},
  color: "#000000",
  strokeColor: undefined,
  strokeWidth: 2,
  opacity: 1,
  tool: "Pencil" as Tool,
  text: "",
  selectedElementId: null,

  setColor: (color) => set({ color }),
  setStrokeColor: (strokeColor) => set({ strokeColor }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
  setOpacity: (opacity) => set({ opacity }),
  setTool: (tool) => set({ tool }),
  setText: (text) => set({ text }),
  setSelectedElement: (selectedElementId) => set({ selectedElementId }),

  startElement: (roomId, point, options) => {
    saveStateForUndo(roomId, get, set);
    const state = get();
    const current = state.canvases[roomId] || [];

    const id = options?.id ?? nanoid();
    const tool = options?.tool ?? state.tool;
    const color = options?.color ?? state.color;
    const strokeColor = options?.strokeColor ?? state.strokeColor ?? color;
    const strokeWidth = options?.strokeWidth ?? state.strokeWidth;
    const opacity = options?.opacity ?? state.opacity;
    const text = options?.text ?? state.text;
    const isTemp = options?.isTemp ?? false;

    let newElement: CanvasElement;

    switch (tool) {
      case "Rect":
        newElement = {
          id,
          type: "rect",
          tool,
          color,
          strokeColor,
          strokeWidth,
          opacity,
          start: point,
          end: point,
        };
        break;

      case "Circle":
        newElement = {
          id,
          type: "circle",
          tool,
          color,
          strokeColor,
          strokeWidth,
          opacity,
          center: point,
          radius: 0,
        };
        break;

      case "Text":
        newElement = {
          id,
          type: "text",
          tool,
          color,
          strokeColor,
          strokeWidth,
          opacity,
          point,
          text,
        };
        break;

      default:
        newElement = {
          id,
          type: "line",
          tool,
          color,
          strokeWidth,
          opacity,
          points: [point],
          isTemp,
        };
        break;
    }

    set({
      canvases: {
        ...state.canvases,
        [roomId]: [...current, newElement],
      },
    });
  },

  updateElement: (roomId, id, point) => {
    const canvases = get().canvases;
    const elements = canvases[roomId] || [];

    const updated = elements.map((el) => {
      if (el.id !== id) return el;

      if (el.type === "line") {
        return { ...el, points: [...el.points, point] };
      } else if (el.type === "rect") {
        return { ...el, end: point };
      } else if (el.type === "circle") {
        const dx = point[0] - el.center[0];
        const dy = point[1] - el.center[1];
        const radius = Math.sqrt(dx * dx + dy * dy);
        return { ...el, radius };
      }

      return el;
    });

    set({
      canvases: {
        ...canvases,
        [roomId]: updated,
      },
    });
  },

  updateTextElement: (roomId, id, newText) => {
    const canvases = get().canvases;
    const elements = canvases[roomId] || [];

    const updated = elements.map((el) =>
      el.id === id && el.type === "text" ? { ...el, text: newText } : el
    );

    set({
      canvases: {
        ...canvases,
        [roomId]: updated,
      },
    });
  },

  updateElementPosition: (roomId, id, pos) => {
    const canvases = get().canvases;
    const elements = canvases[roomId] || [];
    const updated = elements.map((el) =>
      el.id !== id ? el : updateElementPositionHelper(el, pos)
    );
    set({ canvases: { ...canvases, [roomId]: updated } });
  },

  applyMaskToElement: (roomId, elementId, eraserLines, strokeWidths) => {
    saveStateForUndo(roomId, get, set);
    const canvases = get().canvases;
    const elements = canvases[roomId] || [];
    const updated = elements.map((el) =>
      el.id !== elementId ? el : applyMaskHelper(el, eraserLines, strokeWidths)
    );
    set({ canvases: { ...canvases, [roomId]: updated } });
  },

  removeElement: (roomId, id) => {
    const canvases = get().canvases;
    const elements = canvases[roomId] || [];
    set({
      canvases: {
        ...canvases,
        [roomId]: elements.filter((el) => el.id !== id),
      },
    });
  },

  undo: (roomId) => {
    const { canvases, undoStack, redoStack } = get();
    if (!(undoStack[roomId] && undoStack[roomId].length)) return;

    const prev = undoStack[roomId][undoStack[roomId].length - 1];

    set({
      canvases: {
        ...canvases,
        [roomId]: prev,
      },
      undoStack: {
        ...undoStack,
        [roomId]: undoStack[roomId].slice(0, -1),
      },
      redoStack: {
        ...redoStack,
        [roomId]: [
          ...(redoStack[roomId] || []),
          structuredClone(canvases[roomId]),
        ],
      },
    });
  },

  redo: (roomId) => {
    const { canvases, undoStack, redoStack } = get();
    if (!(redoStack[roomId] && redoStack[roomId].length)) return;

    const next = redoStack[roomId][redoStack[roomId].length - 1];

    set({
      canvases: {
        ...canvases,
        [roomId]: next,
      },
      undoStack: {
        ...undoStack,
        [roomId]: [
          ...(undoStack[roomId] || []),
          structuredClone(canvases[roomId]),
        ],
      },
      redoStack: {
        ...redoStack,
        [roomId]: redoStack[roomId].slice(0, -1),
      },
    });
  },

  resetCanvas: (roomId) => {
    saveStateForUndo(roomId, get, set);
    const canvases = get().canvases;
    set({
      canvases: {
        ...canvases,
        [roomId]: [],
      },
    });
  },
}));
