import type { Role } from "@prisma/client";

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  RECEPTIONIST: ["/reception", "/reception/patients", "/billing/invoice"],
  ACCOUNTS: ["/billing", "/reception/patients", "/reports"],
  LAB_SCIENTIST: ["/collection", "/preanalytics", "/processing", "/validation", "/qc", "/dispatch", "/reports", "/reception/patients"],
  SUPERVISOR: ["*"],
};
