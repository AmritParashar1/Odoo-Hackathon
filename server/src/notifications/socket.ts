import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verify } from 'jsonwebtoken';
import { env } from '../config/env';
import logger from '../shared/utils/logger';

let io: SocketIOServer;

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['authorization'];
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = verify(token.replace('Bearer ', ''), env.JWT_SECRET) as { id: string, role: string };
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user.id;
    logger.info(`🔌 Socket connected: ${socket.id} (User: ${userId})`);

    // Join a private room for the user to receive direct notifications
    socket.join(`user:${userId}`);

    // Optionally join a role-based room (e.g. admins get all transfer requests)
    socket.join(`role:${socket.data.user.role}`);

    socket.on('disconnect', () => {
      logger.info(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
