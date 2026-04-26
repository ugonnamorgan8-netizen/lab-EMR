import type { Response } from "express";
import { recordPaymentSchema } from "../../../shared/types/index.js";
import { getInvoiceByVisitId, recordPayment } from "../services/billingService.js";
import type { AuthenticatedRequest } from "../types.js";

export async function getInvoiceHandler(request: AuthenticatedRequest, response: Response) {
  const invoice = await getInvoiceByVisitId(String(request.params.visitId));
  return response.json(invoice);
}

export async function recordPaymentHandler(request: AuthenticatedRequest, response: Response) {
  const payload = recordPaymentSchema.parse(request.body);
  const invoice = await recordPayment(String(request.params.visitId), {
    ...payload,
    recordedBy: request.user!.id,
  });
  return response.json(invoice);
}
