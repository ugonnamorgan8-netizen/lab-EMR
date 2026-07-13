import type { Role } from "@prisma/client";

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  RECEPTIONIST: ["/reception/register", "/reception/new-visit"],
  ACCOUNTS: ["/billing", "/reception/patients"],
  LAB_SCIENTIST: ["/collection", "/preanalytics", "/processing", "/validation", "/qc", "/dispatch", "/reports", "/reception/patients"],
  SUPERVISOR: ["*"],
};
