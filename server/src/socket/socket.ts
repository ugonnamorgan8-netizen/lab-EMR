import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { config } from "../config.js";

let io: Server | null = null;
const socketsByUser = new Map<string, Set<string>>();

function emitPresenceSnapshot() {
  io?.emit("presence:update", {
    activeUsers: socketsByUser.size,
  });
}

function attachSocketToUser(socketId: string, userId: string) {
  const existing = socketsByUser.get(userId);
  if (existing) {
    existing.add(socketId);
  } else {
    socketsByUser.set(userId, new Set([socketId]));
  }
}

function detachSocketFromUser(socketId: string, userId?: string) {
  if (!userId) {
    return;
  }

  const userSockets = socketsByUser.get(userId);
  if (!userSockets) {
    return;
  }

  userSockets.delete(socketId);
  if (userSockets.size === 0) {
    socketsByUser.delete(userId);
  }
}

export function initSocketServer(server: HttpServer) {
  const allowedOrigins = [config.clientUrl, "http://localhost:3000", "http://localhost:5173"].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin(origin, callback) {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Origin not allowed by Socket.IO CORS"));
      },
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    emitPresenceSnapshot();

    socket.on("join:user", (userId: string) => {
      const previousUserId = socket.data.userId as string | undefined;
      if (previousUserId === userId) {
        socket.join(`user:${userId}`);
        emitPresenceSnapshot();
        return;
      }

      detachSocketFromUser(socket.id, previousUserId);
      attachSocketToUser(socket.id, userId);
      socket.data.userId = userId;
      socket.join(`user:${userId}`);
      emitPresenceSnapshot();
    });
    socket.on("join:role", (role: string) => socket.join(`role:${role}`));
    socket.on("join:department", (department: string) => socket.join(`dept:${department}`));
    socket.on("join:visit", (visitId: string) => socket.join(`visit:${visitId}`));
    socket.on("disconnect", () => {
      detachSocketFromUser(socket.id, socket.data.userId as string | undefined);
      emitPresenceSnapshot();
    });
  });

  return io;
}

export function getIo() {
  if (!io) {
    throw new Error("Socket server has not been initialized");
  }

  return io;
}
