const canvasState = require("../state/canvasState");
const updateElementPositionHelper = require("../lib/updateElementPositionHelper");

module.exports = (io, socket) => {
  socket.on(
    "start-line",
    ({
      roomId,
      id,
      point,
      color,
      strokeColor,
      strokeWidth,
      opacity,
      tool,
      text,
      isTemp,
    }) => {
      socket.to(roomId).emit("start-line", {
        roomId,
        id,
        point,
        color,
        strokeColor,
        strokeWidth,
        opacity,
        tool,
        text,
        isTemp,
      });

      if (isTemp) return;

      let type;
      if (tool === "Rect") type = "rect";
      else if (tool === "Circle") type = "circle";
      else if (tool === "Text") type = "text";
      else type = "line";

      const newElement = {
        id,
        type,
        tool,
        color,
        strokeColor,
        strokeWidth,
        opacity,
        // Поля в зависимости от типа:
        ...(type === "rect" && { start: point, end: point }),
        ...(type === "circle" && { center: point, radius: 0 }),
        ...(type === "text" && { point, text }),
        ...(type === "line" && { points: [point] }),
      };

      if (!canvasState[roomId]) {
        canvasState[roomId] = {
          elements: [],
          undoStack: [],
          redoStack: [],
        };
      }

      const state = canvasState[roomId];
      state.undoStack.push(JSON.parse(JSON.stringify(state.elements)));
      state.redoStack = [];
      state.elements.push(newElement);
    }
  );

  socket.on("draw-line", ({ roomId, id, point }) => {
    socket.to(roomId).emit("draw-line", { roomId, id, point });

    if (!canvasState[roomId]) return;
    const elements = canvasState[roomId].elements;
    if (!elements) return;

    const el = elements.find((e) => e.id === id);
    if (!el) return;

    if (el.type === "line") {
      if (!el.points) el.points = [];
      el.points.push(point);
    } else if (el.type === "rect") {
      el.end = point;
    } else if (el.type === "circle") {
      const dx = point[0] - el.center[0];
      const dy = point[1] - el.center[1];
      el.radius = Math.sqrt(dx * dx + dy * dy);
    }
  });

  socket.on("text-change", ({ roomId, id, text }) => {
    socket.to(roomId).emit("text-change", { roomId, id, text });

    if (!canvasState[roomId]) return;
    const elements = canvasState[roomId].elements;
    if (!elements) return;

    const el = elements.find((e) => e.id === id && e.type === "text");
    if (!el) return;

    el.text = text;
  });

  socket.on("move-element", ({ roomId, id, point }) => {
    socket.to(roomId).emit("move-element", { roomId, id, point });

    if (!canvasState[roomId]) return;
    const state = canvasState[roomId];
    const elements = state.elements;
    if (!elements) return;

    state.undoStack.push(JSON.parse(JSON.stringify(state.elements)));

    const idx = elements.findIndex((e) => e.id === id);
    if (idx === -1) return;
    elements[idx] = updateElementPositionHelper(elements[idx], point);

    state.redoStack = [];
  });

  socket.on(
    "apply-mask",
    ({ roomId, elementId, eraserLines, strokeWidths, tempLineId }) => {
      socket.to(roomId).emit("apply-mask", {
        roomId,
        elementId,
        eraserLines,
        strokeWidths,
        tempLineId,
      });

      if (!canvasState[roomId]) return;
      const state = canvasState[roomId];
      const elements = state.elements;
      if (!elements) return;

      state.undoStack.push(JSON.parse(JSON.stringify(state.elements)));

      const el = elements.find((el) => el.id === elementId);
      if (!el) return;

      const maskLines = eraserLines.map((points, idx) => ({
        points,
        strokeWidth: strokeWidths[idx] ?? 2,
      }));

      if (el.mask) {
        el.mask.lines.push(...maskLines);
      } else {
        el.mask = { lines: maskLines };
      }

      state.redoStack = [];
    }
  );

  socket.on("remove-element", ({ roomId, id }) => {
    socket.to(roomId).emit("remove-element", { roomId, elementId: id });

    if (!canvasState[roomId]) return;
    const state = canvasState[roomId];
    const elements = state.elements;
    if (!elements) return;

    state.elements = elements.filter((e) => e.id !== id);
  });

  socket.on("undo", ({ roomId }) => {
    socket.to(roomId).emit("undo", { roomId });

    if (!canvasState[roomId]) return;
    const state = canvasState[roomId];

    if (!state.undoStack.length) return;
    const last = state.undoStack.pop();

    state.redoStack.push(JSON.parse(JSON.stringify(state.elements)));
    state.elements = last;
  });

  socket.on("redo", ({ roomId }) => {
    socket.to(roomId).emit("redo", { roomId });

    if (!canvasState[roomId]) return;
    const state = canvasState[roomId];

    if (!state.redoStack.length) return;
    const next = state.redoStack.pop();

    state.undoStack.push(JSON.parse(JSON.stringify(state.elements)));
    state.elements = next;
  });

  socket.on("update-undoStack", ({ roomId }) => {
    socket.to(roomId).emit("update-undoStack", { roomId });

    if (!canvasState[roomId]) return;
    const state = canvasState[roomId];
    state.undoStack.push(JSON.parse(JSON.stringify(state.elements)));
    state.redoStack = [];
  });

  socket.on("reset-canvas", ({ roomId }) => {
    socket.to(roomId).emit("reset-canvas", { roomId });

    if (!canvasState[roomId]) return;
    const state = canvasState[roomId];

    state.undoStack.push(JSON.parse(JSON.stringify(state.elements)));
    state.elements = [];
    state.redoStack = [];
  });
};
