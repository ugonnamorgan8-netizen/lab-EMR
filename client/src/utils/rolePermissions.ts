import type { Role } from "@shared/index";

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  RECEPTIONIST: ["/reception/register", "/reception/new-visit", "/reception/queue", "/reception/patients", "/billing/invoice"],
  PHLEBOTOMIST: ["/collection/queue", "/collection/", "/reception/queue", "/reception/patients", "/preanalytics/queue"],
  LAB_SCIENTIST: ["/processing/worklist", "/validation/queue", "/qc/dashboard", "/reception/patients", "/referral/queue"],
  LAB_TECHNICIAN: ["/processing/worklist", "/preanalytics/queue", "/reception/patients"],
  QC_OFFICER: ["/qc/dashboard", "/processing/worklist", "/reception/patients"],
  DISPATCH_OFFICER: ["/dispatch/queue", "/reception/patients", "/validation/queue"],
  ACCOUNTANT: ["/billing/dashboard", "/reception/patients", "/billing/outstanding", "/billing/invoice"],
  LAB_MANAGER: ["/admin/analytics", "/admin/users", "/reception/queue", "/qc/dashboard", "/billing/dashboard", "/billing/outstanding", "/reception/patients"],
  ADMIN: ["*"],
};
