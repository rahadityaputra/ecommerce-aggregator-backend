let ioInstance = null;

function initSocket(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    socket.emit('connected', { message: 'Socket connected' });

    socket.on('disconnect', () => {
      // No-op for now
    });
  });

  return io;
}

function getSocket() {
  return ioInstance;
}

function emitEvent(event, payload) {
  if (ioInstance) {
    ioInstance.emit(event, payload);
  }
}

module.exports = {
  initSocket,
  getSocket,
  emitEvent
};
