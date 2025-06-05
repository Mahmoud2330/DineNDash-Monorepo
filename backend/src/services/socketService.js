const { Server } = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join a table room
    socket.on('joinTable', (tableId) => {
      socket.join(`table-${tableId}`);
      console.log(`Client ${socket.id} joined table ${tableId}`);
    });

    // Leave a table room
    socket.on('leaveTable', (tableId) => {
      socket.leave(`table-${tableId}`);
      console.log(`Client ${socket.id} left table ${tableId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

// Event emitters
const emitOrderUpdate = (tableId, orderData) => {
  if (io) {
    io.to(`table-${tableId}`).emit('orderUpdate', orderData);
  }
};

const emitPaymentUpdate = (tableId, paymentData) => {
  if (io) {
    io.to(`table-${tableId}`).emit('paymentUpdate', paymentData);
  }
};

const emitTableSessionUpdate = (tableId, sessionData) => {
  if (io) {
    io.to(`table-${tableId}`).emit('tableSessionUpdate', sessionData);
  }
};

module.exports = {
  initializeSocket,
  emitOrderUpdate,
  emitPaymentUpdate,
  emitTableSessionUpdate
}; 