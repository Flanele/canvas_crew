import { create } from "zustand";

type Line = number[];
type RoomId = string;

interface CanvasStore {
  canvases: Record<RoomId, Line[]>; // Храним линии по roomId
  startLine: (roomId: RoomId, point: [number, number]) => void;
  updateLine: (roomId: RoomId, point: [number, number]) => void;
  resetCanvas: (roomId: RoomId) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  canvases: {},

  startLine: (roomId, point) =>
    set((state) => {
      const current = state.canvases[roomId] || [];
      return {
        canvases: {
          ...state.canvases,
          [roomId]: [...current, [...point]],
        },
      };
    }),

  updateLine: (roomId, point) =>
    set((state) => {
      const lines = state.canvases[roomId] || [];
      const lastLine = lines.pop() || [];
      return {
        canvases: {
          ...state.canvases,
          [roomId]: [...lines, [...lastLine, ...point]],
        },
      };
    }),

  resetCanvas: (roomId) =>
    set((state) => ({
      canvases: { ...state.canvases, [roomId]: [] },
    })),
}));