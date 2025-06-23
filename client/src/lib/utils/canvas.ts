import { nanoid } from "nanoid";
import {
  CanvasElement, Point, MaskLine
} from '../../store/types/canvas';

// Перемещение фигуры
export function updateElementPositionHelper(el: CanvasElement, pos: Point): CanvasElement {
  if (el.type === "rect") {
    const width = Math.abs(el.end[0] - el.start[0]);
    const height = Math.abs(el.end[1] - el.start[1]);
    return {
      ...el,
      start: [pos[0], pos[1]],
      end: [pos[0] + width, pos[1] + height],
    };
  }
  if (el.type === "circle") {
    return { ...el, center: [pos[0], pos[1]] };
  }
  if (el.type === "text") {
    return { ...el, point: [pos[0], pos[1]] };
  }
  if (el.type === "line") {
    const dx = pos[0] - el.points[0][0];
    const dy = pos[1] - el.points[0][1];
    const newPoints = el.points.map(([x, y]) => [x + dx, y + dy] as Point);
    return { ...el, points: newPoints };
  }
  return el;
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