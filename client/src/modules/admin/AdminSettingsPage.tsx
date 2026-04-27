import { useQuery } from "@tanstack/react-query";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import type { AdminSettingsResponse } from "../../types/app";
import { formatDate } from "../../utils/formatDate";

export function AdminSettingsPage() {
  const settingsQuery = useQuery({
    queryKey: queryKeys.adminSettings(),
    queryFn: async () => {
      const response = await api.get("/admin/settings");
      return response.data as AdminSettingsResponse;
    },
  });

  if (settingsQuery.isLoading) {
    return <Skeleton className="h-72 w-full" />;
  }

  if (settingsQuery.isError || !settingsQuery.data) {
    return <EmptyState title="Settings unavailable" message="System settings could not be loaded right now." />;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <p className="text-sm text-slate-500">Users</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{settingsQuery.data.footprint.userCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Patients</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{settingsQuery.data.footprint.patientCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Catalog tests</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{settingsQuery.data.footprint.catalogCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Panels</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{settingsQuery.data.footprint.panelCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Audit records</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{settingsQuery.data.footprint.auditCount}</p>
        </Card>
      </div>

      <Card className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Lab configuration</h3>
          <p className="text-sm text-slate-500">Deployment-visible settings stored in the database</p>
        </div>
        {settingsQuery.data.settings.length === 0 ? (
          <EmptyState title="No settings found" message="Seeded system settings will appear here." />
        ) : (
          <div className="space-y-3">
            {settingsQuery.data.settings.map((setting) => (
              <div key={setting.key} className="rounded-xl border border-brand-border p-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{setting.key}</p>
                    <p className="text-sm text-slate-500">{setting.value}</p>
                  </div>
                  <p className="text-xs text-slate-500">Updated {formatDate(setting.updatedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
