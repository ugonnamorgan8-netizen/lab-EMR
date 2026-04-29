import type { Role } from "@shared/index";

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  RECEPTIONIST: ["/reception/register", "/reception/new-visit"],
  ACCOUNTS: ["/billing/dashboard", "/billing/outstanding", "/billing/invoice", "/reception/patients"],
  LAB_SCIENTIST: ["/collection/queue", "/collection/", "/preanalytics/queue", "/processing/worklist", "/catalog/setup", "/validation/queue", "/qc/dashboard", "/dispatch/queue", "/reception/patients", "/reports/visit"],
  SUPERVISOR: ["*"],
};
