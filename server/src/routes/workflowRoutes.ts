import { Role } from "@prisma/client";
import { Router } from "express";
import {
  createQcRunHandler,
  dispatchReportHandler,
  enterProcessingResultHandler,
  generateReportHandler,
  getBillingDashboardHandler,
  getQcDashboardHandler,
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

workflowRouter.get("/preanalytics", requireRole([Role.PHLEBOTOMIST, Role.LAB_TECHNICIAN, Role.LAB_SCIENTIST, Role.QC_OFFICER, Role.LAB_MANAGER, Role.ADMIN]), listPreanalyticsQueueHandler);
workflowRouter.patch("/samples/:id/status", requireRole([Role.PHLEBOTOMIST, Role.LAB_TECHNICIAN, Role.LAB_SCIENTIST, Role.QC_OFFICER, Role.LAB_MANAGER, Role.ADMIN]), updateSampleWorkflowHandler);

workflowRouter.get("/processing", requireRole([Role.LAB_TECHNICIAN, Role.LAB_SCIENTIST, Role.LAB_MANAGER, Role.ADMIN]), listProcessingWorklistHandler);
workflowRouter.patch("/processing/:id/start", requireRole([Role.LAB_TECHNICIAN, Role.LAB_SCIENTIST, Role.LAB_MANAGER, Role.ADMIN]), startOrderAnalysisHandler);
workflowRouter.post("/processing/:id/result", requireRole([Role.LAB_TECHNICIAN, Role.LAB_SCIENTIST, Role.LAB_MANAGER, Role.ADMIN]), enterProcessingResultHandler);

workflowRouter.get("/validation", requireRole([Role.LAB_SCIENTIST, Role.DISPATCH_OFFICER, Role.LAB_MANAGER, Role.ADMIN]), listValidationQueueHandler);
workflowRouter.patch("/validation/:id/validate", requireRole([Role.LAB_SCIENTIST, Role.LAB_MANAGER, Role.ADMIN]), validateResultHandler);

workflowRouter.get("/qc", requireRole([Role.QC_OFFICER, Role.LAB_SCIENTIST, Role.LAB_MANAGER, Role.ADMIN]), getQcDashboardHandler);
workflowRouter.post("/qc/materials/:id/entries", requireRole([Role.QC_OFFICER, Role.LAB_SCIENTIST, Role.LAB_MANAGER, Role.ADMIN]), createQcRunHandler);

workflowRouter.get("/dispatch", requireRole([Role.DISPATCH_OFFICER, Role.LAB_SCIENTIST, Role.LAB_MANAGER, Role.ADMIN]), listDispatchQueueHandler);
workflowRouter.post("/dispatch/:id/generate", requireRole([Role.DISPATCH_OFFICER, Role.LAB_SCIENTIST, Role.LAB_MANAGER, Role.ADMIN]), generateReportHandler);
workflowRouter.post("/dispatch/:id/dispatch", requireRole([Role.DISPATCH_OFFICER, Role.LAB_SCIENTIST, Role.LAB_MANAGER, Role.ADMIN]), dispatchReportHandler);

workflowRouter.get("/billing/dashboard", requireRole([Role.ACCOUNTANT, Role.LAB_MANAGER, Role.ADMIN]), getBillingDashboardHandler);
workflowRouter.get("/billing/outstanding", requireRole([Role.ACCOUNTANT, Role.LAB_MANAGER, Role.ADMIN]), listOutstandingInvoicesHandler);
