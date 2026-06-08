import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../types.js";

export async function writeAuditLog(
  request: AuthenticatedRequest,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata?: Record<string, unknown>,
) {
  if (!request.user) {
    return;
  }

  await prisma.auditLog.create({
    data: {
      userId: request.user.id,
      action,
      resourceType,
      resourceId,
      ipAddress: request.ip ?? null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}
