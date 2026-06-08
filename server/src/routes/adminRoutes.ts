import { Role } from "@shared/index";
import { Router } from "express";
import {
  createAdminCatalogParameterHandler,
  createAdminCatalogReferenceRangeHandler,
  createAdminUserHandler,
  deleteAdminCatalogParameterHandler,
  deleteAdminCatalogReferenceRangeHandler,
  deleteAdminUserHandler,
  getAdminAnalyticsHandler,
  getAdminCatalogHandler,
  listAdminUsersHandler,
  listAuditLogsHandler,
  listSystemSettingsHandler,
  updateAdminCatalogParameterHandler,
  updateAdminCatalogReferenceRangeHandler,
  updateAdminCatalogTestHandler,
  updateAdminUserHandler,
  updateSystemSettingHandler,
} from "../controllers/adminController.js";
import { requireRole } from "../middleware/rbac.js";

export const adminRouter = Router();
const CATALOG_EDITORS = [Role.LAB_SCIENTIST, Role.SUPERVISOR];
const LAB_CONFIGURATION_EDITORS = [Role.LAB_SCIENTIST, Role.SUPERVISOR];

adminRouter.get("/analytics", requireRole([Role.SUPERVISOR]), getAdminAnalyticsHandler);
adminRouter.get("/users", requireRole([Role.SUPERVISOR]), listAdminUsersHandler);
adminRouter.post("/users", requireRole([Role.SUPERVISOR]), createAdminUserHandler);
adminRouter.patch("/users/:id", requireRole([Role.SUPERVISOR]), updateAdminUserHandler);
adminRouter.delete("/users/:id", requireRole([Role.SUPERVISOR]), deleteAdminUserHandler);
adminRouter.get("/settings", requireRole(LAB_CONFIGURATION_EDITORS), listSystemSettingsHandler);
adminRouter.patch("/settings/:key", requireRole(LAB_CONFIGURATION_EDITORS), updateSystemSettingHandler);
adminRouter.get("/catalog", requireRole(CATALOG_EDITORS), getAdminCatalogHandler);
adminRouter.patch("/catalog/tests/:id", requireRole(CATALOG_EDITORS), updateAdminCatalogTestHandler);
adminRouter.post("/catalog/tests/:id/parameters", requireRole(CATALOG_EDITORS), createAdminCatalogParameterHandler);
adminRouter.patch("/catalog/parameters/:id", requireRole(CATALOG_EDITORS), updateAdminCatalogParameterHandler);
adminRouter.delete("/catalog/parameters/:id", requireRole(CATALOG_EDITORS), deleteAdminCatalogParameterHandler);
adminRouter.post("/catalog/parameters/:id/reference-ranges", requireRole(CATALOG_EDITORS), createAdminCatalogReferenceRangeHandler);
adminRouter.patch("/catalog/reference-ranges/:id", requireRole(CATALOG_EDITORS), updateAdminCatalogReferenceRangeHandler);
adminRouter.delete("/catalog/reference-ranges/:id", requireRole(CATALOG_EDITORS), deleteAdminCatalogReferenceRangeHandler);
adminRouter.get("/audit", requireRole([Role.SUPERVISOR]), listAuditLogsHandler);
