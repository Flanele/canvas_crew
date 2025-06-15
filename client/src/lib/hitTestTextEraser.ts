import { Point } from "../store/types/canvas";

export function hitTestTextEraser(
    eraserPoints: Point[],
    point: Point,
    strokeWidth: number,
    text: string,
    threshold: number = 0
  ): boolean {
    const fontSize = strokeWidth * 4;
    const width = fontSize * text.length * 0.55; // Эмпирически для латиницы
    const height = fontSize * 1.2;
    const [x, y] = point;
    return eraserPoints.some(
      ([ex, ey]) => ex >= x - threshold && ex <= x + width + threshold && ey >= y - threshold && ey <= y + height + threshold
    );
  }
  