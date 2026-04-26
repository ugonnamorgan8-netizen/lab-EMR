import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { config } from "../config.js";
import { readRefreshToken, signAccessToken, signRefreshToken } from "../middleware/auth.js";
import type { AuthenticatedRequest, RequestUser } from "../types.js";

function toRequestUser(user: {
  id: string;
  name: string;
  email: string;
  role: RequestUser["role"];
  department: string | null;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
  };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error("Invalid email or password");
  }

  const authUser = toRequestUser(user);
  const accessToken = signAccessToken(authUser);
  const refreshToken = signRefreshToken(authUser);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  return { user: authUser, accessToken, refreshToken };
}

export function refreshSession(request: AuthenticatedRequest) {
  const refreshToken = readRefreshToken(request);
  if (!refreshToken) {
    throw new Error("Refresh token not provided");
  }

  const payload = jwt.verify(refreshToken, config.jwtRefreshSecret) as RequestUser & {
    tokenType: "refresh";
  };

  return {
    user: payload,
    accessToken: signAccessToken(payload),
  };
}
