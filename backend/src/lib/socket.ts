import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import logger from "./logger";

let io: SocketIOServer;

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    logger.info(`New client connected: ${socket.id}`);

    socket.on("join-board", (boardId: string) => {
      socket.join(boardId);
      logger.info(`User ${socket.id} joined board ${boardId}`);
    });

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
