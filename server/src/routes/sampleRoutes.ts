import { Router } from "express";
import { collectSampleHandler, getSampleHandler, listSamplesHandler } from "../controllers/sampleController.js";

export const sampleRouter = Router();

sampleRouter.get("/", listSamplesHandler);
sampleRouter.get("/:specimenId", getSampleHandler);
sampleRouter.put("/:id", collectSampleHandler);
