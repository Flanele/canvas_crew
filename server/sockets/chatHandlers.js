const fs = require("fs");
const path = require("path");
const { addMessageToHistory } = require("../lib/addMessageToHistory");

module.exports = (io, socket) => {
  socket.on("message", ({ roomId, id, text, username, time, type }) => {
    if (!roomId) {
      return;
    }

    const message = { id, text, username, time, type };

    addMessageToHistory(roomId, message);
    io.to(roomId).emit("message", { id, text, username, time, type });
  });

  socket.on("load-messages", ({ roomId }) => {
    if (!roomId) {
      return;
    }

    const chatDir = path.join(__dirname, "..", "temp", "chats");
    const filePath = path.join(chatDir, `${roomId}.json`);

    let history = [];

    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        history = JSON.parse(raw);
      } catch (error) {
        console.error("❌ Error reading chat file:", err);
      }
    }

    io.to(roomId).emit("load-messages", { roomId, history });
  });
};
