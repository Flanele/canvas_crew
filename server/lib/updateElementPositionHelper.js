function updateElementPositionHelper(el, pos) {
    const oldOrigin = (() => {
      if (el.type === "line") return el.points[0];
      if (el.type === "rect") return el.start;
      if (el.type === "circle") return el.center;
      if (el.type === "text") return el.point;
      return [0, 0];
    })();
    const dx = pos[0] - oldOrigin[0];
    const dy = pos[1] - oldOrigin[1];
  
    let moved;
    if (el.type === "rect") {
      const w = el.end[0] - el.start[0];
      const h = el.end[1] - el.start[1];
      moved = { ...el, start: [pos[0], pos[1]], end: [pos[0] + w, pos[1] + h] };
    } else if (el.type === "circle") {
      moved = { ...el, center: [pos[0], pos[1]] };
    } else if (el.type === "text") {
      moved = { ...el, point: [pos[0], pos[1]] };
    } else if (el.type === "line") {
      const newPts = el.points.map(([x, y]) => [x + dx, y + dy]);
      moved = { ...el, points: newPts };
    } else {
      moved = el;
    }
  
    if (moved.mask) {
      moved = {
        ...moved,
        mask: {
          ...moved.mask,
          lines: moved.mask.lines.map((ln) => ({
            strokeWidth: ln.strokeWidth,
            points: ln.points.map(([x, y]) => [x + dx, y + dy]),
          })),
        },
      };
    }
  
    return moved;
  }

  module.exports = updateElementPositionHelper;
  