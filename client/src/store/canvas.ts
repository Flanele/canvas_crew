import { create } from "zustand";

type Point = [number, number];
type ColoredLine = { points: Point[]; color: string, strokeWidth: number, opacity: number };
type RoomId = string;

interface CanvasStore {
  canvases: Record<RoomId, ColoredLine[]>;
  color: string;
  strokeWidth: number;
  opacity: number;
  setColor: (color: string) => void;
  setStrokeWidth: (strokeWodth: number) => void;
  setOpacity: (opacity: number) => void;
  startLine: (roomId: RoomId, point: Point, color?: string, strokeWidth?: number, opacity?: number) => void;
  updateLine: (roomId: RoomId, point: Point) => void;
  resetCanvas: (roomId: RoomId) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  canvases: {},
  color: '#000000',
  strokeWidth: 2,
  opacity: 1,

  setColor: (color) => {
    set({ color })
  },

  setStrokeWidth: (strokeWidth) => {
    set({ strokeWidth })
  },

  setOpacity: (opacity) => {
    set({ opacity })
  },

  startLine: (roomId, point, color, strokeWidth, opacity) =>
    set((state) => {
      const current = state.canvases[roomId] || [];
      const newLine = {
        points: [point],
        color: color ?? state.color,
        strokeWidth: strokeWidth ?? state.strokeWidth,
        opacity: opacity ?? state.opacity
      };
      return {
        canvases: {
          ...state.canvases,
          [roomId]: [...current, newLine],
        },
      };
    }),

  updateLine: (roomId, point) =>
    set((state) => {
      const lines = state.canvases[roomId] || [];
      const last = lines[lines.length - 1];
      if (!last) return { canvases: state.canvases };
  
      const updatedLine = {
        ...last,
        points: [...last.points, point],
      };
  
      return {
        canvases: {
          ...state.canvases,
          [roomId]: [...lines.slice(0, -1), updatedLine],
        },
      };
    }),

  resetCanvas: (roomId) =>
    set((state) => ({
      canvases: { ...state.canvases, [roomId]: [] },
    })),
}));