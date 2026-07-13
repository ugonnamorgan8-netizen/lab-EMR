import { Router } from "express";
import { getInvoiceHandler, recordPaymentHandler } from "../controllers/billingController.js";
import { Role } from "@prisma/client";
import { requireRole } from "../middleware/rbac.js";

export const billingRouter = Router();

const ACCOUNTS = [Role.ACCOUNTS, Role.SUPERVISOR];

billingRouter.get("/:visitId", requireRole(ACCOUNTS), getInvoiceHandler);
billingRouter.post("/:visitId/payment", requireRole(ACCOUNTS), recordPaymentHandler);
