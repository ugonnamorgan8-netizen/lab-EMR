import { Router } from "express";
import { getInvoiceHandler, recordPaymentHandler } from "../controllers/billingController.js";

export const billingRouter = Router();

billingRouter.get("/:visitId", getInvoiceHandler);
billingRouter.post("/:visitId/payment", recordPaymentHandler);
