import {
  adminCatalogTestUpdateSchema,
  adminUserUpdateSchema,
  systemSettingUpdateSchema,
} from "../../../shared/types/index.js";
import type { Response } from "express";
import {
  getAdminAnalytics,
  getAdminCatalog,
  listAdminUsers,
  listAuditLogs,
  listSystemSettings,
  updateAdminCatalogTest,
  updateAdminUser,
  updateSystemSetting,
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

export async function updateAdminUserHandler(request: AuthenticatedRequest, response: Response) {
  const payload = adminUserUpdateSchema.parse(request.body);
  const user = await updateAdminUser(String(request.params.id), payload, request.user!.id);
  return response.json(user);
}

export async function updateSystemSettingHandler(request: AuthenticatedRequest, response: Response) {
  const payload = systemSettingUpdateSchema.parse(request.body);
  const setting = await updateSystemSetting(String(request.params.key), payload, request.user!.id);
  return response.json(setting);
}

export async function updateAdminCatalogTestHandler(request: AuthenticatedRequest, response: Response) {
  const payload = adminCatalogTestUpdateSchema.parse(request.body);
  const test = await updateAdminCatalogTest(String(request.params.id), payload, request.user!.id);
  return response.json(test);
}
