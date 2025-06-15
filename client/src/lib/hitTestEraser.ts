import { CanvasElement, Point } from "../store/types/canvas";
import { hitTestCircleEraser } from "./hitTestCircleEraser";
import { hitTestLineEraser } from "./hitTestLineEraser";
import { hitTestRectEraser } from "./hitTestRectEraser";
import { hitTestTextEraser } from "./hitTestTextEraser";

export function hitTestEraser(
  eraserPoints: Point[],
  el: CanvasElement,
  threshold: number = 10
) {
  switch (el.type) {
    case "line":
      return hitTestLineEraser(eraserPoints, el.points, threshold);
    case "rect":
      return hitTestRectEraser(eraserPoints, el.start, el.end, threshold);
    case "circle":
      return hitTestCircleEraser(eraserPoints, el.center, el.radius, threshold);
    case "text":
      return hitTestTextEraser(
        eraserPoints,
        el.point,
        el.strokeWidth,
        el.text,
        threshold
      );
    default:
      return false;
  }
}
