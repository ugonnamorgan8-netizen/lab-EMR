import { Router } from "express";
import { createPatientHandler, getPatientHandler, searchPatientsHandler } from "../controllers/patientController.js";

export const patientRouter = Router();

patientRouter.get("/search", searchPatientsHandler);
patientRouter.post("/", createPatientHandler);
patientRouter.get("/:id", getPatientHandler);
