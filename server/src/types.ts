import type { Request } from "express";
import type { Role } from "@prisma/client";

export type RequestUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string | null;
};

export type AuthenticatedRequest = Request & {
  user?: RequestUser;
};
