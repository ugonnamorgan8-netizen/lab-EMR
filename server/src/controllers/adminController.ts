import type { Response } from "express";
import {
  getAdminAnalytics,
  getAdminCatalog,
  listAdminUsers,
  listAuditLogs,
  listSystemSettings,
} from "../services/adminService.js";
import type { AuthenticatedRequest } from "../types.js";

export async function getAdminAnalyticsHandler(_request: AuthenticatedRequest, response: Response) {
  const analytics = await getAdminAnalytics();
  return response.json(analytics);
}

export async function listAdminUsersHandler(_request: AuthenticatedRequest, response: Response) {
  const users = await listAdminUsers();
  return response.json(users);
}

export async function listSystemSettingsHandler(_request: AuthenticatedRequest, response: Response) {
  const settings = await listSystemSettings();
  return response.json(settings);
}

export async function getAdminCatalogHandler(_request: AuthenticatedRequest, response: Response) {
  const catalog = await getAdminCatalog();
  return response.json(catalog);
}

export async function listAuditLogsHandler(_request: AuthenticatedRequest, response: Response) {
  const logs = await listAuditLogs();
  return response.json(logs);
}
