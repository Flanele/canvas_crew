const { nanoid } = require("nanoid");
const { rooms, getVisibleRooms } = require("../models/rooms");
const { addMessageToHistory } = require("../lib/addMessageToHistory");

module.exports = (io, socket) => {
  socket.on("disconnect", () => {
    const username = socket.data.username; 
    const roomId = socket.data.roomId; 

    console.log(`🔌 User ${socket.id} disconnected`);

    const systemMessage = {
      id: nanoid(),
      roomId,
      text: `${username} left the chat`,
      username,
      time: Date.now(),
      type: "system",
    };

    addMessageToHistory(roomId, systemMessage);

    io.to(roomId).emit("message", systemMessage);

    for (const [roomId, room] of rooms.entries()) {
      room.sockets.delete(socket.id);
      console.log(
        `[DEBUG] Комната ${roomId}, осталось сокетов: ${room.sockets.size}`
      );

      if (room.sockets.size === 0 && !room.timeout) {
        room.timeout = setTimeout(() => {
          room.active = false;
          console.log(`😴 Room ${roomId} is now inactive`);
          io.emit("update-rooms", getVisibleRooms());
        }, 30 * 60 * 1000); // 30 minutes
      }
    }
  });
};
