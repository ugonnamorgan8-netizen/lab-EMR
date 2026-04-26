import type { Role } from "@prisma/client";

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  RECEPTIONIST: ["/reception", "/patients", "/queue", "/billing/invoice"],
  PHLEBOTOMIST: ["/collection", "/patients", "/preanalytics"],
  LAB_SCIENTIST: ["/processing", "/validation", "/qc", "/patients", "/referral"],
  LAB_TECHNICIAN: ["/processing", "/preanalytics", "/patients"],
  QC_OFFICER: ["/qc", "/processing", "/patients"],
  DISPATCH_OFFICER: ["/dispatch", "/patients", "/validation"],
  ACCOUNTANT: ["/billing", "/patients", "/reports/billing"],
  LAB_MANAGER: ["*"],
  ADMIN: ["*"],
};
