import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { config } from "../config.js";

let io: Server | null = null;

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
    socket.on("join:user", (userId: string) => socket.join(`user:${userId}`));
    socket.on("join:role", (role: string) => socket.join(`role:${role}`));
    socket.on("join:department", (department: string) => socket.join(`dept:${department}`));
    socket.on("join:visit", (visitId: string) => socket.join(`visit:${visitId}`));
  });

  return io;
}

export function getIo() {
  if (!io) {
    throw new Error("Socket server has not been initialized");
  }

  return io;
}
