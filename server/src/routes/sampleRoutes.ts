import { Router } from "express";
import { collectSampleHandler, getSampleHandler, listSamplesHandler } from "../controllers/sampleController.js";
import { Role } from "@prisma/client";
import { requireRole } from "../middleware/rbac.js";

export const sampleRouter = Router();

const SCIENTIST = [Role.LAB_SCIENTIST, Role.SUPERVISOR];

sampleRouter.get("/", requireRole(SCIENTIST), listSamplesHandler);
sampleRouter.get("/:specimenId", requireRole(SCIENTIST), getSampleHandler);
sampleRouter.put("/:id", requireRole(SCIENTIST), collectSampleHandler);
