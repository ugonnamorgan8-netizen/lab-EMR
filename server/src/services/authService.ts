import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserStatus } from "@shared/index";
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
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error("Invalid email or password");
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new Error("This account is not active");
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

  return prisma.user.findUniqueOrThrow({
    where: { id: payload.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      status: true,
    },
  }).then((user) => {
    if (user.status !== UserStatus.ACTIVE) {
      throw new Error("This account is not active");
    }

    const authUser = toRequestUser(user);
    return {
      user: authUser,
      accessToken: signAccessToken(authUser),
    };
  });
}
