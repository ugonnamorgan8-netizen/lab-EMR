import type { Role } from "@prisma/client";

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  RECEPTIONIST: ["/reception", "/reception/patients", "/billing/invoice"],
  PHLEBOTOMIST: ["/collection", "/reception/queue", "/reception/patients", "/preanalytics"],
  LAB_SCIENTIST: ["/processing", "/validation", "/qc", "/reception/patients", "/referral"],
  LAB_TECHNICIAN: ["/processing", "/preanalytics", "/reception/patients"],
  QC_OFFICER: ["/qc", "/processing", "/reception/patients"],
  DISPATCH_OFFICER: ["/dispatch", "/reception/patients", "/validation"],
  ACCOUNTANT: ["/billing", "/reception/patients", "/reports/billing"],
  LAB_MANAGER: ["/admin/analytics", "/admin/users", "/reception/queue", "/qc", "/billing", "/reception/patients"],
  ADMIN: ["*"],
};
