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

adminRouter.get("/analytics", requireRole([Role.SUPERVISOR]), getAdminAnalyticsHandler);
adminRouter.get("/users", requireRole([Role.SUPERVISOR]), listAdminUsersHandler);
adminRouter.patch("/users/:id", requireRole([Role.SUPERVISOR]), updateAdminUserHandler);
adminRouter.get("/settings", requireRole([Role.SUPERVISOR]), listSystemSettingsHandler);
adminRouter.patch("/settings/:key", requireRole([Role.SUPERVISOR]), updateSystemSettingHandler);
adminRouter.get("/catalog", requireRole([Role.SUPERVISOR]), getAdminCatalogHandler);
adminRouter.patch("/catalog/tests/:id", requireRole([Role.SUPERVISOR]), updateAdminCatalogTestHandler);
adminRouter.get("/audit", requireRole([Role.SUPERVISOR]), listAuditLogsHandler);
