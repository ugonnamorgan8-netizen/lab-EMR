import type { Role } from "@shared/index";

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  RECEPTIONIST: ["/reception/register", "/reception/new-visit"],
  ACCOUNTS: ["/billing", "/reception/patients"],
  LAB_SCIENTIST: ["/collection", "/preanalytics", "/processing", "/validation", "/qc", "/dispatch", "/reports", "/reception/patients"],
  SUPERVISOR: ["*"],
};
