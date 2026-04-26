import { Router } from "express";
import { listCatalogHandler } from "../controllers/catalogController.js";

export const catalogRouter = Router();

catalogRouter.get("/", listCatalogHandler);
