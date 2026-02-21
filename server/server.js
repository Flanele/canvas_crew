const express = require("express");
const http = require("http");
const cors = require("cors");
const clearChatHistory = require("./services/clearChatHistory");
const initSocket = require("./sockets");
const { getVisibleRooms, checkRoomsByIds } = require("./models/rooms");

const { Server } = require("socket.io");

const PORT = process.env.PORT || 3020;

const server = express();

clearChatHistory();

// --- CORS ---
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // для Postman/curl
    cb(null, allowedOrigins.includes(origin));
  },
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
};
server.use(cors(corsOptions));
server.use(express.json());

// --- HTTP & Socket.IO Setup ---
const httpServer = http.createServer(server);
const io = new Server(httpServer, { cors: corsOptions });

// --- Socket.IO ---
initSocket(io);

// --- REST API ---
server.get("/api/rooms", (req, res) => {
  try {
    res.status(200).json(getVisibleRooms());
  } catch (error) {
    console.error("❌ Error fetching rooms:", error);
    res.status(500).json({ message: "Error fetching rooms" });
  }
});

server.post("/api/rooms/check", (req, res) => {
  const { ids } = req.body;
  const foundRooms = checkRoomsByIds(ids);
  res.status(200).json(foundRooms);
});

// --- Start server ---
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server started on :${PORT}`);
});
