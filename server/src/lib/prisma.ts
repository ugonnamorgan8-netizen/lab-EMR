import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __labPrisma: PrismaClient | undefined;
}

export const prisma =
  global.__labPrisma ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__labPrisma = prisma;
}
