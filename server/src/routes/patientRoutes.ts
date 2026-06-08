import { Router } from "express";
import { createPatientHandler, getPatientHandler, listPatientsHandler, searchPatientsHandler } from "../controllers/patientController.js";
import { Role } from "@shared/index";
import { requireRole } from "../middleware/rbac.js";

export const patientRouter = Router();

const RECEPTION = [Role.RECEPTIONIST, Role.SUPERVISOR];
const ALL_STAFF = [Role.RECEPTIONIST, Role.ACCOUNTS, Role.LAB_SCIENTIST, Role.SUPERVISOR];

patientRouter.get("/", requireRole(ALL_STAFF), listPatientsHandler);
patientRouter.get("/search", requireRole(ALL_STAFF), searchPatientsHandler);
patientRouter.post("/", requireRole(RECEPTION), createPatientHandler);
patientRouter.get("/:id", requireRole(ALL_STAFF), getPatientHandler);
