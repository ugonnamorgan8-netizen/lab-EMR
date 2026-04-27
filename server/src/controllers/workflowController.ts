import type { Response } from "express";
import {
  dispatchReportSchema,
  processingResultEntrySchema,
  qcEntryCreateSchema,
  sampleWorkflowUpdateSchema,
} from "../../../shared/types/index.js";
import type { AuthenticatedRequest } from "../types.js";
import {
  createQcRun,
  dispatchReport,
  enterProcessingResult,
  generateReport,
  getBillingDashboard,
  getQcDashboard,
  listDispatchQueue,
  listOutstandingInvoices,
  listPreanalyticsSamples,
  listProcessingWorklist,
  listValidationQueue,
  startOrderAnalysis,
  updateSampleWorkflow,
  validateResult,
} from "../services/workflowService.js";

export async function listPreanalyticsQueueHandler(_request: AuthenticatedRequest, response: Response) {
  const samples = await listPreanalyticsSamples();
  return response.json(samples);
}

export async function updateSampleWorkflowHandler(request: AuthenticatedRequest, response: Response) {
  const payload = sampleWorkflowUpdateSchema.parse(request.body);
  const sample = await updateSampleWorkflow(String(request.params.id), payload);
  return response.json(sample);
}

export async function listProcessingWorklistHandler(_request: AuthenticatedRequest, response: Response) {
  const worklist = await listProcessingWorklist();
  return response.json(worklist);
}

export async function startOrderAnalysisHandler(request: AuthenticatedRequest, response: Response) {
  const order = await startOrderAnalysis(String(request.params.id));
  return response.json(order);
}

export async function enterProcessingResultHandler(request: AuthenticatedRequest, response: Response) {
  const payload = processingResultEntrySchema.parse(request.body);
  const result = await enterProcessingResult(String(request.params.id), payload, request.user!.id);
  return response.json(result);
}

export async function listValidationQueueHandler(_request: AuthenticatedRequest, response: Response) {
  const queue = await listValidationQueue();
  return response.json(queue);
}

export async function validateResultHandler(request: AuthenticatedRequest, response: Response) {
  const result = await validateResult(String(request.params.id), request.user!.id);
  return response.json(result);
}

export async function getQcDashboardHandler(_request: AuthenticatedRequest, response: Response) {
  const dashboard = await getQcDashboard();
  return response.json(dashboard);
}

export async function createQcRunHandler(request: AuthenticatedRequest, response: Response) {
  const payload = qcEntryCreateSchema.parse(request.body);
  const entry = await createQcRun(String(request.params.id), payload, request.user!.id);
  return response.status(201).json(entry);
}

export async function listDispatchQueueHandler(_request: AuthenticatedRequest, response: Response) {
  const queue = await listDispatchQueue();
  return response.json(queue);
}

export async function generateReportHandler(request: AuthenticatedRequest, response: Response) {
  const report = await generateReport(String(request.params.id));
  return response.json(report);
}

export async function dispatchReportHandler(request: AuthenticatedRequest, response: Response) {
  const payload = dispatchReportSchema.parse(request.body);
  const report = await dispatchReport(String(request.params.id), payload, request.user!.id);
  return response.json(report);
}

export async function getBillingDashboardHandler(_request: AuthenticatedRequest, response: Response) {
  const dashboard = await getBillingDashboard();
  return response.json(dashboard);
}

export async function listOutstandingInvoicesHandler(_request: AuthenticatedRequest, response: Response) {
  const invoices = await listOutstandingInvoices();
  return response.json(invoices);
}
