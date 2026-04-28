import { Router } from "express";
import { createVisitHandler, listVisitsHandler, updateVisitStatusHandler } from "../controllers/visitController.js";
import { Role } from "@prisma/client";
import { requireRole } from "../middleware/rbac.js";

export const visitRouter = Router();

const RECEPTION = [Role.RECEPTIONIST, Role.SUPERVISOR];
const ALL_STAFF = [Role.RECEPTIONIST, Role.ACCOUNTS, Role.LAB_SCIENTIST, Role.SUPERVISOR];
const SCIENTIST = [Role.LAB_SCIENTIST, Role.SUPERVISOR];

visitRouter.post("/", requireRole(RECEPTION), createVisitHandler);
visitRouter.get("/", requireRole(ALL_STAFF), listVisitsHandler);
visitRouter.put("/:id/status", requireRole(SCIENTIST), updateVisitStatusHandler);
