const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3020;

const server = express();

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
        }, 60_000); // 1 minute
      }
    }
  });

  socket.on("join-room", ({ roomId }) => {
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
      io.emit("update-rooms", getVisibleRooms());
    }
  });

  socket.on("message", ({ roomId, id, text, username, time }) => {
    if (roomId) {
      console.log(`✉️  User ${username} sent '${text}' in room ${roomId}`);
      io.to(roomId).emit("message", { id, text, username, time });
    }
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
