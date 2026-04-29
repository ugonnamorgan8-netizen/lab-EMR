import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MetricCard } from "../../components/shared/MetricCard";
import { PageHero } from "../../components/shared/PageHero";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import { useAuthStore } from "../../stores/authStore";
import type { AdminSettingsResponse } from "../../types/app";
import { formatDate } from "../../utils/formatDate";

export function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const settingsQuery = useQuery({
    queryKey: queryKeys.adminSettings(),
    queryFn: async () => {
      const response = await api.get("/admin/settings");
      return response.data as AdminSettingsResponse;
    },
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await api.patch(`/admin/settings/${encodeURIComponent(key)}`, { value });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminSettings() });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminAudit() });
    },
    onSettled: () => {
      setSavingKey(null);
    },
  });

  if (settingsQuery.isLoading) {
    return <Skeleton className="h-72 w-full" />;
  }

  if (settingsQuery.isError || !settingsQuery.data) {
    return <EmptyState title="Settings unavailable" message="System settings could not be loaded right now." />;
  }

  const isScientistRoute = user?.role === "LAB_SCIENTIST";
  const labSettings = settingsQuery.data.settings.filter((setting) => setting.key.startsWith("lab."));
  const visibleSettings = labSettings.length > 0 ? labSettings : settingsQuery.data.settings;

  return (
    <div className="space-y-4">
      <PageHero
        eyebrow={isScientistRoute ? "Laboratory Configuration" : "System Settings"}
        title={isScientistRoute ? "Scientist lab configuration" : "Laboratory settings"}
        description={
          isScientistRoute
            ? "Update the laboratory identity used across reports and the application workspace, including branding, contact information, director details, and report labels."
            : "Control facility branding and report identity from the shared settings store used across the application."
        }
        aside={
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-slate-100">
            Settings: {visibleSettings.length}
          </div>
        }
      />

      {!isScientistRoute ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Users" value={settingsQuery.data.footprint.userCount} hint="Total system accounts" icon="🧑‍💻" variant="blue" />
          <MetricCard label="Patients" value={settingsQuery.data.footprint.patientCount} hint="Registered patient records" icon="👥" variant="teal" />
          <MetricCard label="Catalog tests" value={settingsQuery.data.footprint.catalogCount} hint="Tests in the active catalog" icon="🗃️" variant="violet" />
          <MetricCard label="Panels" value={settingsQuery.data.footprint.panelCount} hint="Defined test panels" icon="📂" variant="amber" />
          <MetricCard label="Audit records" value={settingsQuery.data.footprint.auditCount} hint="Logged operational events" icon="🔍" variant="indigo" />
        </div>
      ) : null}

      <Card variant="gradient" className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 text-xl text-white shadow">
            ⚙️
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Lab configuration</h3>
            <p className="text-sm text-slate-500">Facility identity, report branding, and contact information live here and feed the printable result output.</p>
          </div>
        </div>
        {visibleSettings.length === 0 ? (
          <EmptyState title="No settings found" message="Seeded system settings will appear here." />
        ) : (
          <div className="space-y-3">
            {visibleSettings.map((setting) => {
              const draftValue = drafts[setting.key] ?? setting.value;
              const isDirty = draftValue !== setting.value;

              return (
                <div key={setting.key} className="rounded-2xl border border-brand-border bg-white/70 p-3 shadow-sm">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{setting.key}</p>
                        <p className="text-xs text-slate-500">Updated {formatDate(setting.updatedAt)}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                      <input
                        className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                        value={draftValue}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [setting.key]: event.target.value,
                          }))
                        }
                      />
                      <div className="flex gap-2">
                        <Button
                          disabled={!isDirty || (updateSetting.isPending && savingKey === setting.key)}
                          onClick={() => {
                            setSavingKey(setting.key);
                            updateSetting.mutate({ key: setting.key, value: draftValue });
                          }}
                        >
                          {updateSetting.isPending && savingKey === setting.key ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          variant="secondary"
                          disabled={!isDirty}
                          onClick={() =>
                            setDrafts((current) => {
                              const next = { ...current };
                              delete next[setting.key];
                              return next;
                            })
                          }
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
