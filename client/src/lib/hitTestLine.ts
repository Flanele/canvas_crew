export function hitTestLine(
  point: [number, number],
  linePoints: [number, number][],
  threshold: number
): boolean {
  for (let i = 0; i < linePoints.length - 1; i++) {
    const [x1, y1] = linePoints[i];
    const [x2, y2] = linePoints[i + 1];
    if (distancePointToSegment(point, [x1, y1], [x2, y2]) <= threshold) {
      return true;
    }
  }
  return false;
}

// Вспомогательная функция — расстояние от точки до отрезка
function distancePointToSegment(
  [px, py]: [number, number],
  [x1, y1]: [number, number],
  [x2, y2]: [number, number]
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) {
    // отрезок — точка
    return Math.hypot(px - x1, py - y1);
  }
  // проекция точки на прямую (x1, y1) — (x2, y2)
  let t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}
