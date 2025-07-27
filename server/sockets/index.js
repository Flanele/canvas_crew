const roomHandlers = require('./roomHandlers');
const canvasHandlers = require('./canvasHandlers');
const chatHandlers = require('./chatHandlers');
const disconnectHandler = require('./disconnectHandler');

module.exports = function initSocket(io) {
  io.on('connection', (socket) => {
    roomHandlers(io, socket);
    canvasHandlers(io, socket);
    chatHandlers(io, socket);
    disconnectHandler(io, socket);
  });
};