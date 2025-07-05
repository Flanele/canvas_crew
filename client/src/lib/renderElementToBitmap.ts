import { BASE_WIDTH } from "../components/Canvas";
import { CanvasElement, MaskLine } from "../store/types/canvas";
import { wrapText } from "./wrapText";

export interface BitmapResult {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

function catmullRomSpline(points: number[][], segments = 16): number[][] {
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
      const x =
        0.5 *
        (2 * p1[0] +
          (-p0[0] + p2[0]) * s +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * s2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * s3);
      const y =
        0.5 *
        (2 * p1[1] +
          (-p0[1] + p2[1]) * s +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * s2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * s3);
      result.push([x, y]);
    }
  }
  result.push(points[points.length - 1]);
  return result;
}

export function renderElementToBitmap(
  el: CanvasElement,
  eraserMasks: MaskLine[] = []
): BitmapResult {
  const allPoints: number[][] = [];

  const scale = window.devicePixelRatio || 1;

  // 1. Собираем все ключевые точки элемента (и текста, и масок) для вычисления общего bounding box
  if (el.type === "line") allPoints.push(...el.points);
  if (el.type === "rect") allPoints.push(el.start, el.end);
  if (el.type === "circle") {
    allPoints.push(
      [el.center[0] - el.radius, el.center[1] - el.radius],
      [el.center[0] + el.radius, el.center[1] + el.radius]
    );
  }
  if (el.type === "text") {
    const fontSize = el.strokeWidth * 4;
    const padding = 10;
    const maxWidth = BASE_WIDTH - el.point[0] - padding;
    const lines = wrapText(el.text, maxWidth, fontSize);
    const lineHeight = fontSize * 1.2;
    let maxTextWidth = 0;

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCtx.font = `${fontSize}px Calibri, Arial, sans-serif`;

    for (let i = 0; i < lines.length; i++) {
      const w = tempCtx.measureText(lines[i]).width;
      if (w > maxTextWidth) maxTextWidth = w;
      allPoints.push([el.point[0], el.point[1] + i * lineHeight]);
      allPoints.push([el.point[0] + w, el.point[1] + (i + 1) * lineHeight]);
    }
    const textHeight = lineHeight * lines.length;
    allPoints.push([el.point[0], el.point[1]]);
    allPoints.push([el.point[0] + maxTextWidth, el.point[1] + textHeight]);
  }

  eraserMasks.forEach((mask) => allPoints.push(...mask.points));

  const maskPoints = eraserMasks.flatMap((m) => m.points);
  const bboxPoints = [...allPoints, ...maskPoints];

  const xs = bboxPoints.map(([x]) => x);
  const ys = bboxPoints.map(([, y]) => y);
  const pad = 60;
  // 2. Вычисляем общий bounding box (с учетом паддинга) для корректного экспорта bitmap
  const minX = Math.min(...xs) - pad / 2;
  const minY = Math.min(...ys) - pad / 2;
  const maxX = Math.max(...xs) + pad / 2;
  const maxY = Math.max(...ys) + pad / 2;
  const width = Math.ceil(maxX - minX);
  const height = Math.ceil(maxY - minY);
  // 3. Создаём offscreen canvas с учетом retina (devicePixelRatio) и смещением bbox
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  ctx.save();
  ctx.translate(-minX, -minY);

  // 4. Рисуем сам элемент (линию, прямоугольник, круг или текст)
  switch (el.type) {
    case "line": {
      ctx.strokeStyle = el.tool === "Eraser" ? "#fff" : el.color;
      ctx.lineWidth = el.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = el.opacity;

      if (el.tool === "Brush") {
        ctx.shadowBlur = 3;
        ctx.shadowColor = el.color;
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
      ctx.beginPath();
      ctx.arc(el.center[0], el.center[1], el.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case "text": {
      const fontSize = el.strokeWidth * 4;
      ctx.font = `${fontSize}px Calibri, Arial, sans-serif`;
      ctx.textBaseline = "top";
      ctx.globalAlpha = el.opacity;
      ctx.fillStyle = el.color;

      const padding = 10;
      const maxWidth = BASE_WIDTH - el.point[0] - padding;
      const lines = wrapText(el.text, maxWidth, fontSize);
      const lineHeight = fontSize * 1.2;

      for (let i = 0; i < lines.length; ++i) {
        ctx.fillText(lines[i], el.point[0], el.point[1] + i * lineHeight);

        if (
          el.strokeColor &&
          el.strokeColor !== el.color &&
          el.strokeColor !== "transparent"
        ) {
          ctx.save();
          ctx.strokeStyle = el.strokeColor;
          ctx.lineWidth = 1;
          ctx.strokeText(lines[i], el.point[0], el.point[1] + i * lineHeight);
          ctx.restore();
        }
      }
      break;
    }
  }

  // 5. Поверх элемента рисуем маски (ластик), вырезая нужные области
  eraserMasks.forEach((line) => {
    console.log(
      "draw mask",
      line.points.map(([x, y]) => [x, y])
    );

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
