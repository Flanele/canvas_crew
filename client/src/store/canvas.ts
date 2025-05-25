import { create } from "zustand";
import { nanoid } from "nanoid";

type Point = [number, number];
type RoomId = string;

export type Tool = 'Pencil' | 'Brush' | 'Eraser' | 'Marker' | 'Rect' | 'Circle' | 'Text' | 'Select';

interface BaseShape {
  id: string;
  tool: Tool;
  color: string;
  strokeWidth: number;
  opacity: number;
}

interface LineShape extends BaseShape {
  type: 'line';
  points: Point[];
}

interface RectShape extends BaseShape {
  type: 'rect';
  start: Point;
  end: Point;
  strokeColor: string;
}

interface CircleShape extends BaseShape {
  type: 'circle';
  center: Point;
  radius: number;
  strokeColor: string;
}

interface TextShape extends BaseShape {
  type: 'text';
  point: Point;
  text: string;
  strokeColor: string;
}

export type CanvasElement = LineShape | RectShape | CircleShape | TextShape;

interface CanvasStore {
  canvases: Record<RoomId, CanvasElement[]>;
  color: string;
  strokeColor: string | undefined;
  strokeWidth: number;
  opacity: number;
  tool: Tool;
  text: string;

  setColor: (color: string) => void;
  setStrokeColor: (strokeColor: string) => void;
  setStrokeWidth: (strokeWidth: number) => void;
  setOpacity: (opacity: number) => void;
  setTool: (tool: Tool) => void;
  setText: (text: string) => void;

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
    }
  ) => void;

  updateElement: (roomId: RoomId, point: Point) => void;
  updateTextElement: (roomId: RoomId, id: string, text: string) => void;
  resetCanvas: (roomId: RoomId) => void;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  canvases: {},
  color: '#000000',
  strokeColor: undefined,
  strokeWidth: 2,
  opacity: 1,
  tool: 'Pencil',
  text: '',

  setColor: (color) => set({ color }),
  setStrokeColor: (strokeColor) => set({ strokeColor }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
  setOpacity: (opacity) => set({ opacity }),
  setTool: (tool) => set({ tool }),
  setText: (text) => set({ text }),

  startElement: (roomId, point, options) => {
    const state = get();
    const current = state.canvases[roomId] || [];

    const id = options?.id ?? nanoid();
    const tool = options?.tool ?? state.tool;
    const color = options?.color ?? state.color;
    const strokeColor = options?.strokeColor ?? state.strokeColor ?? color;
    const strokeWidth = options?.strokeWidth ?? state.strokeWidth;
    const opacity = options?.opacity ?? state.opacity;
    const text = options?.text ?? state.text;

    let newElement: CanvasElement;

    switch (tool) {
      case 'Rect':
        newElement = {
          id,
          type: 'rect',
          tool,
          color,
          strokeColor,
          strokeWidth,
          opacity,
          start: point,
          end: point,
        };
        break;

      case 'Circle':
        newElement = {
          id,
          type: 'circle',
          tool,
          color,
          strokeColor,
          strokeWidth,
          opacity,
          center: point,
          radius: 0,
        };
        break;

      case 'Text':
        newElement = {
          id,
          type: 'text',
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
          type: 'line',
          tool,
          color,
          strokeWidth,
          opacity,
          points: [point],
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

  updateElement: (roomId, point) => {
    const canvases = get().canvases;
    const elements = canvases[roomId] || [];
    const last = elements[elements.length - 1];
    if (!last) return;

    let updated: CanvasElement;

    switch (last.type) {
      case 'line':
        updated = { ...last, points: [...last.points, point] };
        break;
      case 'rect':
        updated = { ...last, end: point };
        break;
      case 'circle': {
        const dx = point[0] - last.center[0];
        const dy = point[1] - last.center[1];
        const radius = Math.sqrt(dx * dx + dy * dy);
        updated = { ...last, radius };
        break;
      }
      default:
        return;
    }

    set({
      canvases: {
        ...canvases,
        [roomId]: [...elements.slice(0, -1), updated],
      },
    });
  },

  updateTextElement: (roomId, id, newText) => {
    const canvases = get().canvases;
    const elements = canvases[roomId] || [];

    const updated = elements.map((el) =>
      el.id === id && el.type === 'text' ? { ...el, text: newText } : el
    );

    set({
      canvases: {
        ...canvases,
        [roomId]: updated,
      },
    });
  },

  resetCanvas: (roomId) => {
    const canvases = get().canvases;
    set({
      canvases: {
        ...canvases,
        [roomId]: [],
      },
    });
  },
}));