import { Router } from "express";
import { createVisitHandler, listVisitsHandler, updateVisitStatusHandler } from "../controllers/visitController.js";

export const visitRouter = Router();

visitRouter.post("/", createVisitHandler);
visitRouter.get("/", listVisitsHandler);
visitRouter.put("/:id/status", updateVisitStatusHandler);
