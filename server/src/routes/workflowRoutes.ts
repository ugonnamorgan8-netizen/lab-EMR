import { Role } from "@prisma/client";
import { Router } from "express";
import {
  createQcRunHandler,
  dispatchReportHandler,
  editResultHandler,
  enterManualResultHandler,
  enterProcessingResultHandler,
  generateReportHandler,
  getBillingDashboardHandler,
  getQcDashboardHandler,
  getVisitResultsHandler,
  listDispatchQueueHandler,
  listOutstandingInvoicesHandler,
  listPreanalyticsQueueHandler,
  listProcessingWorklistHandler,
  listValidationQueueHandler,
  startOrderAnalysisHandler,
  updateSampleWorkflowHandler,
  validateResultHandler,
} from "../controllers/workflowController.js";
import { requireRole } from "../middleware/rbac.js";

export const workflowRouter = Router();

const SCIENTIST = [Role.LAB_SCIENTIST, Role.SUPERVISOR];
const ACCOUNTS = [Role.ACCOUNTS, Role.SUPERVISOR];
const ALL_STAFF = [Role.RECEPTIONIST, Role.ACCOUNTS, Role.LAB_SCIENTIST, Role.SUPERVISOR];

workflowRouter.get("/preanalytics", requireRole(SCIENTIST), listPreanalyticsQueueHandler);
workflowRouter.patch("/samples/:id/status", requireRole(SCIENTIST), updateSampleWorkflowHandler);

workflowRouter.get("/processing", requireRole(SCIENTIST), listProcessingWorklistHandler);
workflowRouter.patch("/processing/:id/start", requireRole(SCIENTIST), startOrderAnalysisHandler);
workflowRouter.post("/processing/:id/result", requireRole(SCIENTIST), enterProcessingResultHandler);

// Manual per-analyte result entry and amendment
workflowRouter.post("/processing/:id/result-manual", requireRole(SCIENTIST), enterManualResultHandler);
workflowRouter.patch("/results/:id/amend", requireRole(SCIENTIST), editResultHandler);
workflowRouter.get("/visits/:visitId/results", requireRole(ALL_STAFF), getVisitResultsHandler);

workflowRouter.get("/validation", requireRole(SCIENTIST), listValidationQueueHandler);
workflowRouter.patch("/validation/:id/validate", requireRole(SCIENTIST), validateResultHandler);

workflowRouter.get("/qc", requireRole(SCIENTIST), getQcDashboardHandler);
workflowRouter.post("/qc/materials/:id/entries", requireRole(SCIENTIST), createQcRunHandler);

workflowRouter.get("/dispatch", requireRole(SCIENTIST), listDispatchQueueHandler);
workflowRouter.post("/dispatch/:id/generate", requireRole(SCIENTIST), generateReportHandler);
workflowRouter.post("/dispatch/:id/dispatch", requireRole(SCIENTIST), dispatchReportHandler);

workflowRouter.get("/billing/dashboard", requireRole(ACCOUNTS), getBillingDashboardHandler);
workflowRouter.get("/billing/outstanding", requireRole(ACCOUNTS), listOutstandingInvoicesHandler);
