import {
  adminCatalogParameterSchema,
  adminCatalogReferenceRangeSchema,
  adminUserCreateSchema,
  adminUserDeleteSchema,
  adminCatalogTestUpdateSchema,
  adminUserUpdateSchema,
  systemSettingUpdateSchema,
} from "../../../shared/types/index.js";
import type { Response } from "express";
import {
  createAdminCatalogParameter,
  createAdminCatalogReferenceRange,
  createAdminUser,
  deleteAdminCatalogParameter,
  deleteAdminCatalogReferenceRange,
  deleteAdminUser,
  getAdminAnalytics,
  getAdminCatalog,
  listAdminUsers,
  listAuditLogs,
  listSystemSettings,
  updateAdminCatalogParameter,
  updateAdminCatalogReferenceRange,
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

export async function createAdminUserHandler(request: AuthenticatedRequest, response: Response) {
  const payload = adminUserCreateSchema.parse(request.body);
  const user = await createAdminUser(payload, request.user!.id);
  return response.status(201).json(user);
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

export async function deleteAdminUserHandler(request: AuthenticatedRequest, response: Response) {
  const payload = adminUserDeleteSchema.parse({
    preserveData: request.query.preserveData !== "false",
  });
  const result = await deleteAdminUser(String(request.params.id), payload, request.user!.id);
  return response.json(result);
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

export async function createAdminCatalogParameterHandler(request: AuthenticatedRequest, response: Response) {
  const payload = adminCatalogParameterSchema.parse(request.body);
  const parameter = await createAdminCatalogParameter(String(request.params.id), payload, request.user!.id);
  return response.status(201).json(parameter);
}

export async function updateAdminCatalogParameterHandler(request: AuthenticatedRequest, response: Response) {
  const payload = adminCatalogParameterSchema.parse(request.body);
  const parameter = await updateAdminCatalogParameter(String(request.params.id), payload, request.user!.id);
  return response.json(parameter);
}

export async function deleteAdminCatalogParameterHandler(request: AuthenticatedRequest, response: Response) {
  const result = await deleteAdminCatalogParameter(String(request.params.id), request.user!.id);
  return response.json(result);
}

export async function createAdminCatalogReferenceRangeHandler(request: AuthenticatedRequest, response: Response) {
  const payload = adminCatalogReferenceRangeSchema.parse(request.body);
  const range = await createAdminCatalogReferenceRange(String(request.params.id), payload, request.user!.id);
  return response.status(201).json(range);
}

export async function updateAdminCatalogReferenceRangeHandler(request: AuthenticatedRequest, response: Response) {
  const payload = adminCatalogReferenceRangeSchema.parse(request.body);
  const range = await updateAdminCatalogReferenceRange(String(request.params.id), payload, request.user!.id);
  return response.json(range);
}

export async function deleteAdminCatalogReferenceRangeHandler(request: AuthenticatedRequest, response: Response) {
  const result = await deleteAdminCatalogReferenceRange(String(request.params.id), request.user!.id);
  return response.json(result);
}
