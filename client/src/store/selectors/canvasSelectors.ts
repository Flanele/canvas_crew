import { useCanvasStore } from "../canvas";

export const useTool = () => useCanvasStore((s) => s.tool);
export const useColor = () => useCanvasStore((s) => s.color);
export const useStrokeColor = () => useCanvasStore((s) => s.strokeColor);
export const useStrokeWidth = () => useCanvasStore((s) => s.strokeWidth);
export const useOpacity = () => useCanvasStore((s) => s.opacity);
export const useText = () => useCanvasStore((s) => s.text);
export const useSelectedElementId = () =>
  useCanvasStore((s) => s.selectedElementId);

export const useCanvases = () => useCanvasStore((s) => s.canvases);

const EMPTY_ARRAY: any[] = [];
export const useCanvasElements = (roomId: string) =>
  useCanvasStore((s) => s.canvases[roomId] ?? EMPTY_ARRAY);

// --- Action selectors:
export const useSetTool = () => useCanvasStore((s) => s.setTool);
export const useSetColor = () => useCanvasStore((s) => s.setColor);
export const useSetStrokeColor = () => useCanvasStore((s) => s.setStrokeColor);
export const useSetStrokeWidth = () => useCanvasStore((s) => s.setStrokeWidth);
export const useSetOpacity = () => useCanvasStore((s) => s.setOpacity);
export const useSetText = () => useCanvasStore((s) => s.setText);
export const useSetSelectedElement = () =>
  useCanvasStore((s) => s.setSelectedElement);

export const useStartElement = () => useCanvasStore((s) => s.startElement);
export const useUpdateElement = () => useCanvasStore((s) => s.updateElement);
export const useUpdateTextElement = () =>
  useCanvasStore((s) => s.updateTextElement);
export const useUpdateElementPosition = () =>
  useCanvasStore((s) => s.updateElementPosition);
export const useApplyMaskToElement = () =>
  useCanvasStore((s) => s.applyMaskToElement);
export const useResetCanvas = () => useCanvasStore((s) => s.resetCanvas);
export const useRemoveElement = () => useCanvasStore((s) => s.removeElement);
