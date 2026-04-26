import type { Role } from "@shared/index";

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  RECEPTIONIST: ["/reception/register", "/reception/new-visit", "/reception/queue", "/reception/patients", "/billing/invoice"],
  PHLEBOTOMIST: ["/collection/queue", "/patients", "/preanalytics/queue"],
  LAB_SCIENTIST: ["/processing/worklist", "/validation/queue", "/qc/dashboard", "/patients", "/referral/queue"],
  LAB_TECHNICIAN: ["/processing/worklist", "/preanalytics/queue", "/patients"],
  QC_OFFICER: ["/qc/dashboard", "/processing/worklist", "/patients"],
  DISPATCH_OFFICER: ["/dispatch/queue", "/patients", "/validation/queue"],
  ACCOUNTANT: ["/billing/dashboard", "/patients", "/billing/outstanding"],
  LAB_MANAGER: ["*"],
  ADMIN: ["*"],
};
