import { create } from "zustand";

type Point = [number, number];
type ColoredLine = { points: Point[]; color: string, strokeWidth: number };
type RoomId = string;

interface CanvasStore {
  canvases: Record<RoomId, ColoredLine[]>;
  color: string;
  strokeWidth: number;
  setColor: (color: string) => void;
  setStrokeWidth: (strokeWodth: number) => void;
  startLine: (roomId: RoomId, point: Point, color?: string, strokeWidth?: number) => void;
  updateLine: (roomId: RoomId, point: Point) => void;
  resetCanvas: (roomId: RoomId) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  canvases: {},
  color: '#00000',
  strokeWidth: 2,

  setColor: (color) => {
    set({ color })
  },

  setStrokeWidth: (strokeWidth) => {
    set({ strokeWidth })
  },

  startLine: (roomId, point, color, strokeWidth) =>
    set((state) => {
      const current = state.canvases[roomId] || [];
      const newLine = {
        points: [point],
        color: color ?? state.color,
        strokeWidth: strokeWidth ?? state.strokeWidth, // если не передали — используем свой цвет
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