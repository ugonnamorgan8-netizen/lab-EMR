import { Router } from "express";
import { getInvoiceHandler, recordPaymentHandler } from "../controllers/billingController.js";
import { Role } from "@shared/index";
import { requireRole } from "../middleware/rbac.js";

export const billingRouter = Router();

const ACCOUNTS = [Role.ACCOUNTS, Role.SUPERVISOR];

billingRouter.get("/:visitId", requireRole(ACCOUNTS), getInvoiceHandler);
billingRouter.post("/:visitId/payment", requireRole(ACCOUNTS), recordPaymentHandler);
