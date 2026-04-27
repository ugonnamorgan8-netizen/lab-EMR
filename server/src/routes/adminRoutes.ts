import { Role } from "@prisma/client";
import { Router } from "express";
import {
  getAdminAnalyticsHandler,
  getAdminCatalogHandler,
  listAdminUsersHandler,
  listAuditLogsHandler,
  listSystemSettingsHandler,
  updateAdminCatalogTestHandler,
  updateAdminUserHandler,
  updateSystemSettingHandler,
} from "../controllers/adminController.js";
import { requireRole } from "../middleware/rbac.js";

export const adminRouter = Router();

adminRouter.get("/analytics", requireRole([Role.ADMIN, Role.LAB_MANAGER]), getAdminAnalyticsHandler);
adminRouter.get("/users", requireRole([Role.ADMIN, Role.LAB_MANAGER]), listAdminUsersHandler);
adminRouter.patch("/users/:id", requireRole([Role.ADMIN]), updateAdminUserHandler);
adminRouter.get("/settings", requireRole([Role.ADMIN]), listSystemSettingsHandler);
adminRouter.patch("/settings/:key", requireRole([Role.ADMIN]), updateSystemSettingHandler);
adminRouter.get("/catalog", requireRole([Role.ADMIN]), getAdminCatalogHandler);
adminRouter.patch("/catalog/tests/:id", requireRole([Role.ADMIN]), updateAdminCatalogTestHandler);
adminRouter.get("/audit", requireRole([Role.ADMIN]), listAuditLogsHandler);
