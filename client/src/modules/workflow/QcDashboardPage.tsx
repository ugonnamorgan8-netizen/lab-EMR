import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MetricCard } from "../../components/shared/MetricCard";
import { PageHero } from "../../components/shared/PageHero";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import type { QcDashboardResponse } from "../../types/app";
import { formatDate } from "../../utils/formatDate";

export function QcDashboardPage() {
  const queryClient = useQueryClient();
  const [entryValues, setEntryValues] = useState<Record<string, string>>({});
  const qc = useQuery({
    queryKey: queryKeys.qc(),
    queryFn: async () => {
      const response = await api.get("/workflows/qc");
      return response.data as QcDashboardResponse;
    },
  });

  const createEntry = useMutation({
    mutationFn: async ({ materialId, value }: { materialId: string; value: number }) => {
      const response = await api.post(`/workflows/qc/materials/${materialId}/entries`, { value });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.qc() });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminAudit() });
    },
  });

  if (qc.isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (qc.isError || !qc.data) {
    return <EmptyState title="QC dashboard unavailable" message="Quality control metrics could not be loaded." />;
  }

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Quality Assurance"
        title="QC dashboard"
        description="Monitor Levey-Jennings style run quality through recent z-scores, material expiry, and immediate warning or reject rule visibility."
        aside={<div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-100">Active materials: {qc.data.summary.activeMaterials}</div>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Active materials" value={qc.data.summary.activeMaterials} hint="Controls currently in service" />
        <MetricCard label="Warning runs" value={qc.data.summary.warningRuns} hint="Recent 1-2s alerts requiring closer watch" />
        <MetricCard label="Rejected runs" value={qc.data.summary.rejectedRuns} hint="Out-of-control runs that should block release" />
        <MetricCard label="Expiring soon" value={qc.data.summary.expiringSoon} hint="Materials within the next 30 days of expiry" />
      </div>

      {qc.data.materials.length === 0 ? (
        <EmptyState title="No QC materials configured" message="QC materials will appear here once loaded into the system." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {qc.data.materials.map((material) => (
            <Card key={material.id} className="space-y-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{material.testCatalog.code}</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">
                    {material.name} · {material.level}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {material.testCatalog.name} · Lot {material.lotNumber} · Expires {formatDate(material.expiryDate)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={material.active ? "IN_CONTROL" : "INACTIVE"} />
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    Mean {material.targetMean} / SD {material.targetSD}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                <Input
                  label="Record a new QC value"
                  type="number"
                  value={entryValues[material.id] ?? ""}
                  onChange={(event) => setEntryValues((current) => ({ ...current, [material.id]: event.target.value }))}
                  placeholder="e.g. 10.4"
                />
                <Button
                  disabled={!entryValues[material.id] || createEntry.isPending}
                  onClick={() =>
                    createEntry.mutate({
                      materialId: material.id,
                      value: Number(entryValues[material.id]),
                    })
                  }
                >
                  Record run
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">Recent runs</p>
                {material.entries.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">No QC entries recorded yet.</div>
                ) : (
                  material.entries.map((entry) => (
                    <div key={entry.id} className="flex flex-col gap-2 rounded-2xl border border-brand-border p-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium text-slate-900">
                          Value {entry.value} · z-score {entry.zScore}
                        </p>
                        <p className="text-sm text-slate-500">{formatDate(entry.runDate)} · entered by {entry.enteredBy}</p>
                      </div>
                      <StatusBadge status={entry.rule} />
                    </div>
                  ))
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
