const { rooms, getVisibleRooms } = require("../models/rooms");
const canvasState = require("../state/canvasState");
const { nanoid } = require("nanoid");

module.exports = (io, socket) => {
  socket.on("create-room", ({ roomId, isPrivate }) => {
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
        preview: "",
      };
      rooms.set(roomId, room);
    }

    if (room.timeout) {
      clearTimeout(room.timeout);
      delete room.timeout;
    }

    // room.sockets.add(socket.id);
    room.active = true;

    io.emit("update-rooms", getVisibleRooms());
  });

  socket.on("join-room", ({ roomId, username }) => {
    const room = rooms.get(roomId);

    if (!room) {
      socket.emit("room-not-found", { roomId });
      return;
    }

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

  socket.on("update-room-preview", ({ roomId, preview }) => {
    const room = rooms.get(roomId);
    if (room) room.preview = preview;

    io.emit("update-room-preview", { roomId, preview });
  });
};
