import { Point } from "../store/types/canvas";

export function hitTestRectEraser(
  eraserPoints: Point[],
  start: Point,
  end: Point,
  threshold: number = 0
): boolean {
  const [x1, y1] = start;
  const [x2, y2] = end;
  const left = Math.min(x1, x2) - threshold;
  const right = Math.max(x1, x2) + threshold;
  const top = Math.min(y1, y2) - threshold;
  const bottom = Math.max(y1, y2) + threshold;
  return eraserPoints.some(
    ([ex, ey]) => ex >= left && ex <= right && ey >= top && ey <= bottom
  );
}
