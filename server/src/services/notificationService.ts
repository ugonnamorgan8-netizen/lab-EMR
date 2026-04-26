import type { NotificationType } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { getIo } from "../socket/socket.js";

export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  resourceLink?: string;
}) {
  const notification = await prisma.notification.create({
    data: input,
  });

  getIo().to(`user:${input.userId}`).emit("notification:new", {
    userId: input.userId,
    notification,
  });

  return notification;
}
