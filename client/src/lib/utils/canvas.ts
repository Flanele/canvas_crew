import { nanoid } from "nanoid";
import {
  CanvasElement,
  Point,
  MaskLine,
  RoomId,
} from "../../store/types/canvas";
import { CanvasStore } from "../../store/canvas";

// Перемещение фигуры + её маски
export function updateElementPositionHelper(
  el: CanvasElement,
  pos: Point
): CanvasElement {
  // рассчитываем дельту перемещения
  const oldOrigin = (() => {
    if (el.type === "line") return el.points[0];
    if (el.type === "rect") return el.start;
    if (el.type === "circle") return el.center;
    if (el.type === "text") return el.point;
    return [0, 0] as Point;
  })();
  const dx = pos[0] - oldOrigin[0];
  const dy = pos[1] - oldOrigin[1];

  // 1) Перемещаем саму фигуру
  let moved: CanvasElement;
  if (el.type === "rect") {
    const w = el.end[0] - el.start[0];
    const h = el.end[1] - el.start[1];
    moved = { ...el, start: [pos[0], pos[1]], end: [pos[0] + w, pos[1] + h] };
  } else if (el.type === "circle") {
    moved = { ...el, center: [pos[0], pos[1]] };
  } else if (el.type === "text") {
    moved = { ...el, point: [pos[0], pos[1]] };
  } else if (el.type === "line") {
    const newPts = el.points.map(([x, y]) => [x + dx, y + dy] as Point);
    moved = { ...el, points: newPts };
  } else {
    moved = el;
  }

  // 2) Если у фигуры есть маска — сдвигаем её точно так же
  if (moved.mask) {
    moved = {
      ...moved,
      mask: {
        ...moved.mask,
        lines: moved.mask.lines.map((ln) => ({
          strokeWidth: ln.strokeWidth,
          points: ln.points.map(([x, y]) => [x + dx, y + dy] as Point),
        })),
      },
    };
  }

  return moved;
}

// Маска
export function applyMaskHelper(
  el: CanvasElement,
  eraserLines: Point[][],
  strokeWidths: number[]
): CanvasElement {
  const maskLines: MaskLine[] = eraserLines.map((line, idx) => ({
    points: line,
    strokeWidth: strokeWidths[idx] ?? 2,
  }));

  const newMask = {
    id: nanoid(),
    lines: maskLines,
  };

  return {
    ...el,
    mask: el.mask
      ? { ...el.mask, lines: [...el.mask.lines, ...maskLines] }
      : newMask,
  };
}

export function saveStateForUndo(
  roomId: RoomId,
  get: () => CanvasStore,
  set: (partial: Partial<CanvasStore>) => void
) {
  const canvases = get().canvases;
  const undoStack = get().undoStack;
  set({
    undoStack: {
      ...undoStack,
      [roomId]: [
        ...(undoStack[roomId] || []),
        structuredClone(canvases[roomId] || []),
      ],
    },
    redoStack: {
      ...get().redoStack,
      [roomId]: [],
    },
  });
}
