import { Router } from "express";
import { listNotificationsHandler } from "../controllers/notificationController.js";

export const notificationRouter = Router();

notificationRouter.get("/", listNotificationsHandler);
