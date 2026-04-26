import type { NextFunction, Response } from "express";
import type { Role } from "@prisma/client";
import type { AuthenticatedRequest } from "../types.js";

export function requireRole(allowedRoles: Role[]) {
  return (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
    if (!request.user || !allowedRoles.includes(request.user.role)) {
      return response.status(403).json({ message: "You do not have permission to perform this action" });
    }

    next();
  };
}
