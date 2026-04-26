import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import type { AuthenticatedRequest, RequestUser } from "../types.js";

type TokenPayload = RequestUser & { tokenType: "access" | "refresh" };

export function signAccessToken(user: RequestUser) {
  return jwt.sign({ ...user, tokenType: "access" } satisfies TokenPayload, config.jwtAccessSecret, {
    expiresIn: "15m",
  });
}

export function signRefreshToken(user: RequestUser) {
  return jwt.sign({ ...user, tokenType: "refresh" } satisfies TokenPayload, config.jwtRefreshSecret, {
    expiresIn: "7d",
  });
}

export function requireAuth(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const authHeader = request.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (!token) {
    return response.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, config.jwtAccessSecret) as TokenPayload;
    request.user = payload;
    next();
  } catch {
    return response.status(401).json({ message: "Invalid or expired access token" });
  }
}

export function readRefreshToken(request: AuthenticatedRequest) {
  return request.cookies?.[config.refreshCookieName] as string | undefined;
}
