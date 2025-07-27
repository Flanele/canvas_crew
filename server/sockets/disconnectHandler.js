const { rooms, getVisibleRooms } = require("../models/rooms");

module.exports = (io, socket) => {
  socket.on("disconnect", () => {
    console.log(`🔌 User ${socket.id} disconnected`);

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
