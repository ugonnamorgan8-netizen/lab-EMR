import type { Response } from "express";
import { collectSampleSchema } from "../../../shared/types/index.js";
import { getSampleBySpecimenId, listSamples, collectSample } from "../services/sampleService.js";
import type { AuthenticatedRequest } from "../types.js";

export async function listSamplesHandler(request: AuthenticatedRequest, response: Response) {
  const samples = await listSamples({
    visitId: request.query.visitId as string | undefined,
    status: request.query.status as string | undefined,
  });
  return response.json(samples);
}

export async function getSampleHandler(request: AuthenticatedRequest, response: Response) {
  const sample = await getSampleBySpecimenId(String(request.params.specimenId));
  return response.json(sample);
}

export async function collectSampleHandler(request: AuthenticatedRequest, response: Response) {
  const payload = collectSampleSchema.parse(request.body);
  const sample = await collectSample(String(request.params.id), {
    userId: request.user!.id,
    collectedAt: payload.collectedAt,
    condition: payload.condition,
    conditionNote: payload.conditionNote,
  });
  return response.json(sample);
}
