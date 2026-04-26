import type { Request, Response } from "express";
import { createVisitSchema } from "../../../shared/types/index.js";
import { createVisitAndInvoice, listVisits, updateVisitStatus } from "../services/visitService.js";

export async function createVisitHandler(request: Request, response: Response) {
  const payload = createVisitSchema.parse(request.body);
  const visit = await createVisitAndInvoice(payload);
  return response.status(201).json(visit);
}

export async function listVisitsHandler(request: Request, response: Response) {
  const visits = await listVisits({
    date: request.query.date as string | undefined,
    status: request.query.status as string | undefined,
    urgency: request.query.urgency as string | undefined,
  });
  return response.json(visits);
}

export async function updateVisitStatusHandler(request: Request, response: Response) {
  const visit = await updateVisitStatus(String(request.params.id), request.body.status);
  return response.json(visit);
}
