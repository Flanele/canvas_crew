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
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "DELETE"],
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
httpServer.listen(PORT, () => {
  console.log(`🚀 Server started at http://localhost:${PORT}`);
});
