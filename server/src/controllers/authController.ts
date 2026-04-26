import type { Request, Response } from "express";
import { loginSchema } from "../../../shared/types/index.js";
import { config } from "../config.js";
import { login, refreshSession } from "../services/authService.js";
import type { AuthenticatedRequest } from "../types.js";

function setRefreshCookie(response: Response, refreshToken: string) {
  response.cookie(config.refreshCookieName, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function loginHandler(request: Request, response: Response) {
  const payload = loginSchema.parse(request.body);
  const session = await login(payload.email, payload.password);
  setRefreshCookie(response, session.refreshToken);
  return response.json(session);
}

export async function refreshHandler(request: AuthenticatedRequest, response: Response) {
  const session = refreshSession(request);
  return response.json(session);
}

export async function logoutHandler(_request: Request, response: Response) {
  response.clearCookie(config.refreshCookieName);
  return response.status(204).send();
}
