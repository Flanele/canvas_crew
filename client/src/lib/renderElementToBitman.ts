import { CanvasElement, MaskLine } from "../store/types/canvas";

export interface BitmapResult {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

function catmullRomSpline(points: number[][], tension = 0.6, segments = 16): number[][] {
  if (points.length < 3) return points;
  const result: number[][] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1] || points[i];
    const p3 = points[i + 2] || p2;
    for (let t = 0; t < segments; t++) {
      const s = t / segments;
      const s2 = s * s;
      const s3 = s2 * s;
      const x = 0.5 * (
        (2 * p1[0]) +
        (-p0[0] + p2[0]) * s +
        (2*p0[0] - 5*p1[0] + 4*p2[0] - p3[0]) * s2 +
        (-p0[0] + 3*p1[0] - 3*p2[0] + p3[0]) * s3
      );
      const y = 0.5 * (
        (2 * p1[1]) +
        (-p0[1] + p2[1]) * s +
        (2*p0[1] - 5*p1[1] + 4*p2[1] - p3[1]) * s2 +
        (-p0[1] + 3*p1[1] - 3*p2[1] + p3[1]) * s3
      );
      result.push([x, y]);
    }
  }
  result.push(points[points.length-1]);
  return result;
}

export function renderElementToBitmap(
  el: CanvasElement,
  eraserMasks: MaskLine[] = []
): BitmapResult {
  // bounding box для всего, как раньше
  const allPoints: number[][] = [];
  if (el.type === "line") allPoints.push(...el.points);
  if (el.type === "rect") allPoints.push(el.start, el.end);
  if (el.type === "circle") {
    allPoints.push(
      [el.center[0] - el.radius, el.center[1] - el.radius],
      [el.center[0] + el.radius, el.center[1] + el.radius]
    );
  }
  if (el.type === "text") allPoints.push(el.point);
  eraserMasks.forEach(mask => allPoints.push(...mask.points));

  const xs = allPoints.map(([x]) => x);
  const ys = allPoints.map(([, y]) => y);
  const pad = 60;
  const minX = Math.min(...xs) - pad / 2;
  const minY = Math.min(...ys) - pad / 2;
  const maxX = Math.max(...xs) + pad / 2;
  const maxY = Math.max(...ys) + pad / 2;
  const width = Math.ceil(maxX - minX);
  const height = Math.ceil(maxY - minY);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.save();
  ctx.translate(-minX, -minY);

  switch (el.type) {
    case "line": {
      ctx.strokeStyle = el.tool === "Eraser" ? "#fff" : el.color;
      ctx.lineWidth = el.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = el.opacity;

      // Кисть и маркер — стили
      if (el.tool === "Brush") {
        ctx.shadowBlur = 3;
        ctx.shadowColor = el.color;
        // Сглаживаем линию
        const smooth = catmullRomSpline(el.points, 0.6);
        ctx.beginPath();
        ctx.moveTo(smooth[0][0], smooth[0][1]);
        smooth.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.stroke();
      } else if (el.tool === "Marker") {
        ctx.globalAlpha = el.opacity * 0.8;
        ctx.shadowBlur = 6;
        ctx.shadowColor = el.color;
        ctx.globalCompositeOperation = "multiply";
        ctx.beginPath();
        ctx.moveTo(el.points[0][0], el.points[0][1]);
        el.points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.stroke();
      } else {
        // Обычная линия (tension: 0)
        ctx.beginPath();
        ctx.moveTo(el.points[0][0], el.points[0][1]);
        el.points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.stroke();
      }
      break;
    }
    case "rect": {
      ctx.fillStyle = el.color;
      ctx.strokeStyle = el.strokeColor;
      ctx.lineWidth = el.strokeWidth;
      ctx.globalAlpha = el.opacity;
      ctx.lineJoin = "round";
      ctx.beginPath();
      const x = el.start[0];
      const y = el.start[1];
      const w = el.end[0] - el.start[0];
      const h = el.end[1] - el.start[1];
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

  // Маска — аккуратно стираем, тоже скруглённо!
  eraserMasks.forEach((line) => {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.lineWidth = line.strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(line.points[0][0], line.points[0][1]);
    line.points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.stroke();
    ctx.restore();
  });

  ctx.restore();

  return {
    src: canvas.toDataURL(),
    x: minX,
    y: minY,
    width,
    height,
  };
}