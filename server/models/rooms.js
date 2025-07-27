// --- Room storage ---
/** @type {Map<string, { id: string, name: string, sockets: Set<string>, active: boolean, private: boolean, timeout?: NodeJS.Timeout, preview: string }>} */
const rooms = new Map();

function getVisibleRooms() {
  return Array.from(rooms.values())
    .filter((room) => room.active && !room.private)
    .map(({ id, name, preview }) => ({ id, name, preview }));
}

function checkRoomsByIds(ids) {
  return Array.from(rooms.values())
    .filter((room) => ids.includes(room.id))
    .map(({ id, name, preview }) => ({ id, name, preview }));
}

module.exports = { rooms, getVisibleRooms, checkRoomsByIds };
