// backend/src/config/socket.js
// STATUS: 🆕 NEW FILE
const { logger } = require('../utils/logger');

const setupSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const user = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = user;
      } catch (err) {
  logger.warn("Invalid socket token");
}
    }
    next();
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} | User: ${socket.user?.id || 'anon'}`);
    if (socket.user) {
      socket.join(`role:${socket.user.role}`);
      socket.join(`user:${socket.user.id}`);
    }
    socket.on('subscribe:results', ({ semesterId }) => socket.join(`results:${semesterId}`));
    socket.on('subscribe:attendance', ({ classId }) => socket.join(`attendance:${classId}`));
    socket.on('subscribe:dashboard', () => { if (socket.user) socket.join(`dashboard:${socket.user.role}`); });
    socket.on('disconnect', () => logger.info(`Socket disconnected: ${socket.id}`));
  });

  io.emitToRole = (role, event, data) => io.to(`role:${role}`).emit(event, data);
  io.emitToUser = (userId, event, data) => io.to(`user:${userId}`).emit(event, data);
  io.emitResultPublished = (semesterId, data) => io.to(`results:${semesterId}`).emit('results:published', data);
  io.emitAttendanceUpdate = (classId, data) => io.to(`attendance:${classId}`).emit('attendance:updated', data);
io.emitAttendanceWarning =
(
 userId,
 data
) =>
  io.to(
    `user:${userId}`
  ).emit(
    "attendance:warning",
    data
  );
  logger.info('✅ Socket.IO initialized');
  return io;
};

module.exports = { setupSocket };