import { Point } from "../store/types/canvas";

export function hitTestLineEraser(
  eraserPoints: Point[],
  linePoints: Point[],
  threshold: number = 10
): boolean {
  return eraserPoints.some(([ex, ey]) =>
    linePoints.some(([lx, ly]) => {
      const dx = ex - lx;
      const dy = ey - ly;
      return Math.sqrt(dx * dx + dy * dy) <= threshold;
    })
  );
}
