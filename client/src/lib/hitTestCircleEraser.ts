import { Point } from "../store/types/canvas";

export function hitTestCircleEraser(
  eraserPoints: Point[],
  center: Point,
  radius: number,
  threshold: number = 0
): boolean {
  return eraserPoints.some(([ex, ey]) => {
    const dx = ex - center[0];
    const dy = ey - center[1];
    return Math.sqrt(dx * dx + dy * dy) <= radius + threshold;
  });
}
