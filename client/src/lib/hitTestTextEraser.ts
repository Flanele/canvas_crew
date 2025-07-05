import { BASE_WIDTH } from "../components/Canvas";
import { Point } from "../store/types/canvas";
import { wrapText } from "./wrapText";

export function hitTestTextEraser(
  eraserPoints: Point[],
  point: Point, 
  strokeWidth: number,
  text: string,
  threshold: number,
): boolean {
  const fontSize = strokeWidth * 4;
  const lineHeight = fontSize * 1.2;
  const padding = 10;

  const maxWidth = BASE_WIDTH - point[0] - padding;
  const lines = wrapText(text, maxWidth, fontSize);

  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d")!;
  tempCtx.font = `${fontSize}px Calibri, Arial, sans-serif`;

  for (let i = 0; i < lines.length; i++) {
      const w = tempCtx.measureText(lines[i]).width;
      const h = lineHeight;
      const x = point[0];
      const y = point[1] + i * lineHeight;

      for (const [ex, ey] of eraserPoints) {
          if (
              ex >= x - threshold && ex <= x + w + threshold &&
              ey >= y - threshold && ey <= y + h + threshold
          ) {
              return true; 
          }
      }
  }
  return false;
}
  