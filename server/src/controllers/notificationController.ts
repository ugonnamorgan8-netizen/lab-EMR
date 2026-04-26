import type { Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../types.js";

export async function listNotificationsHandler(request: AuthenticatedRequest, response: Response) {
  const notifications = await prisma.notification.findMany({
    where: { userId: request.user!.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return response.json(notifications);
}
