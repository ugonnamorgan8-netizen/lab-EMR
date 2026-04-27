import { Role } from "@prisma/client";
import { Router } from "express";
import {
  getAdminAnalyticsHandler,
  getAdminCatalogHandler,
  listAdminUsersHandler,
  listAuditLogsHandler,
  listSystemSettingsHandler,
} from "../controllers/adminController.js";
import { requireRole } from "../middleware/rbac.js";

export const adminRouter = Router();

adminRouter.get("/analytics", requireRole([Role.ADMIN, Role.LAB_MANAGER]), getAdminAnalyticsHandler);
adminRouter.get("/users", requireRole([Role.ADMIN, Role.LAB_MANAGER]), listAdminUsersHandler);
adminRouter.get("/settings", requireRole([Role.ADMIN]), listSystemSettingsHandler);
adminRouter.get("/catalog", requireRole([Role.ADMIN]), getAdminCatalogHandler);
adminRouter.get("/audit", requireRole([Role.ADMIN]), listAuditLogsHandler);
