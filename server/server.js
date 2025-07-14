const express = require("express");
const http = require("http");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const clearChatHistory = require("./services/clearChatHistory");
const canvasState = require("./state/canvasState");
const updateElementPositionHelper = require("./lib/updateElementPositionHelper");
const { nanoid } = require("nanoid");

const { Server } = require("socket.io");

const PORT = process.env.PORT || 3020;

const server = express();

clearChatHistory();

// --- CORS ---
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "DELETE"],
};
server.use(cors(corsOptions));

// --- HTTP & Socket.IO Setup ---
const httpServer = http.createServer(server);
const io = new Server(httpServer, { cors: corsOptions });

// --- Room storage ---
/** @type {Map<string, { id: string, name: string, sockets: Set<string>, active: boolean, private: boolean, timeout?: NodeJS.Timeout }>} */
const rooms = new Map();

// --- Socket.IO ---
io.on("connection", (socket) => {
  console.log(`🟢 Socket.IO: User ${socket.id} connected`);

  socket.on("create-room", ({ roomId, isPrivate = false }) => {
    socket.join(roomId);
    console.log(`👤 User ${socket.id} created room ${roomId}`);

    let room = rooms.get(roomId);
    if (!room) {
      room = {
        id: roomId,
        name: `Room ${rooms.size + 1}`,
        sockets: new Set(),
        active: true,
        private: isPrivate,
      };
      rooms.set(roomId, room);
    }

    if (room.timeout) {
      clearTimeout(room.timeout);
      delete room.timeout;
    }

    room.sockets.add(socket.id);
    room.active = true;

    io.emit("update-rooms", getVisibleRooms());
  });

  socket.on("disconnect", () => {
    console.log(`🔌 User ${socket.id} disconnected`);

    for (const [roomId, room] of rooms.entries()) {
      room.sockets.delete(socket.id);

      if (room.sockets.size === 0 && !room.timeout) {
        room.timeout = setTimeout(() => {
          room.active = false;
          console.log(`😴 Room ${roomId} is now inactive`);
          io.emit("update-rooms", getVisibleRooms());
        }, 1200_000); // 20 minutes
      }
    }
  });

  socket.on("join-room", ({ roomId, username }) => {
    const room = rooms.get(roomId);
    if (room) {
      socket.join(roomId);
      room.sockets.add(socket.id);
      room.active = true;

      if (room.timeout) {
        clearTimeout(room.timeout);
        delete room.timeout;
      }

      console.log(`🔁 User ${socket.id} joined room ${roomId}`);

      const systemMessage = {
        id: nanoid(),
        roomId,
        text: `${username} joined the chat`,
        username,
        time: Date.now(),
        type: "system",
      };

      io.to(roomId).emit("message", systemMessage);

      io.emit("update-rooms", getVisibleRooms());

      if (canvasState[roomId]) {
        const { elements, undoStack, redoStack } = canvasState[roomId];
        socket.emit("loading-canvas", {
          roomId,
          elements,
          undoStack,
          redoStack,
        });
      }
    }
  });

  socket.on("message", ({ roomId, id, text, username, time, type }) => {
    if (!roomId) {
      return;
    }

    const message = { id, text, username, time, type };

    const chatDir = path.join(__dirname, "temp", "chats");
    const filePath = path.join(chatDir, `${roomId}.json`);

    fs.mkdirSync(chatDir, { recursive: true });

    let history = [];

    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        history = JSON.parse(raw);
      } catch (err) {
        console.error("❌ Error reading chat file:", err);
      }
    }

    history.push(message);

    try {
      fs.writeFileSync(filePath, JSON.stringify(history, null, 2), "utf-8");
      console.log(`💾 Saved message to ${filePath}`);
    } catch (err) {
      console.error("❌ Error saving chat:", err);
    }

    console.log(`✉️  User ${username} sent '${text}' in room ${roomId}`);
    io.to(roomId).emit("message", { id, text, username, time, type });
  });

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
});

// --- REST API ---
server.get("/api/rooms", (req, res) => {
  try {
    res.json(getVisibleRooms());
  } catch (error) {
    console.error("❌ Error fetching rooms:", error);
    res.status(500).json({ message: "Error fetching rooms" });
  }
});

function getVisibleRooms() {
  return Array.from(rooms.values())
    .filter((room) => room.active && !room.private)
    .map(({ id, name }) => ({ id, name }));
}

// --- Start server ---
httpServer.listen(PORT, () => {
  console.log(`🚀 Server started at http://localhost:${PORT}`);
});
