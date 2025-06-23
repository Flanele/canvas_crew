import { CanvasElement, MaskLine } from "../store/types/canvas";

export interface BitmapResult {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function renderElementToBitmap(
  el: CanvasElement,
  eraserMasks: MaskLine[] = []
): BitmapResult {
  const WIDTH = 750;
  const HEIGHT = 450;

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d")!;

  switch (el.type) {
    case "line": {
      ctx.strokeStyle = el.color;
      ctx.lineWidth = el.strokeWidth;
      ctx.lineCap = "round";
      ctx.globalAlpha = el.opacity;

      if (el.tool === "Brush") {
        ctx.shadowBlur = 3;
        ctx.shadowColor = el.color;
      }
      if (el.tool === "Marker") {
        ctx.globalAlpha = el.opacity * 0.8;
        ctx.shadowBlur = 6;
        ctx.shadowColor = el.color;
        ctx.globalCompositeOperation = "multiply";
      }

      ctx.beginPath();
      ctx.moveTo(el.points[0][0], el.points[0][1]);
      el.points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.stroke();
      break;
    }

    case "rect": {
      ctx.fillStyle = el.color;
      ctx.strokeStyle = el.strokeColor;
      ctx.lineWidth = el.strokeWidth;
      ctx.globalAlpha = el.opacity;
      const x = el.start[0];
      const y = el.start[1];
      const w = el.end[0] - el.start[0];
      const h = el.end[1] - el.start[1];
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case "circle": {
      ctx.fillStyle = el.color;
      ctx.strokeStyle = el.strokeColor;
      ctx.lineWidth = el.strokeWidth;
      ctx.globalAlpha = el.opacity;
      ctx.beginPath();
      ctx.arc(el.center[0], el.center[1], el.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case "text": {
      ctx.fillStyle = el.color;
      ctx.strokeStyle = el.strokeColor;
      ctx.lineWidth = el.strokeWidth;
      ctx.globalAlpha = el.opacity;
      ctx.font = `${el.strokeWidth * 4}px Calibri, Arial, sans-serif`;
      ctx.textBaseline = "top";
      ctx.fillText(el.text, el.point[0], el.point[1]);
      ctx.strokeText(el.text, el.point[0], el.point[1]);
      break;
    }
  }

  // Рисуем маску (глобальные координаты!)
  eraserMasks.forEach((line) => {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.lineWidth = line.strokeWidth;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(line.points[0][0], line.points[0][1]);
    line.points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.stroke();
    ctx.restore();
  });

  return {
    src: canvas.toDataURL(),
    x: 0,
    y: 0,
    width: WIDTH,
    height: HEIGHT,
  };
}
