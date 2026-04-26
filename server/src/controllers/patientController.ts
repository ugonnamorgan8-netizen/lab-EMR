import type { Request, Response } from "express";
import { patientRegistrationSchema } from "../../../shared/types/index.js";
import { createPatient, getPatientById, searchPatients } from "../services/patientService.js";

export async function searchPatientsHandler(request: Request, response: Response) {
  const query = String(request.query.q ?? "");
  const patients = query ? await searchPatients(query) : [];
  return response.json(patients);
}

export async function createPatientHandler(request: Request, response: Response) {
  const payload = patientRegistrationSchema.parse(request.body);
  const patient = await createPatient(payload);
  return response.status(201).json(patient);
}

export async function getPatientHandler(request: Request, response: Response) {
  const patient = await getPatientById(String(request.params.id));
  return response.json(patient);
}
