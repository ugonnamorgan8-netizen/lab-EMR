import { Router } from "express";
import { listCatalogHandler } from "../controllers/catalogController.js";
import { Role } from "@shared/index";
import { requireRole } from "../middleware/rbac.js";

export const catalogRouter = Router();

catalogRouter.get("/", requireRole([Role.RECEPTIONIST, Role.SUPERVISOR]), listCatalogHandler);
