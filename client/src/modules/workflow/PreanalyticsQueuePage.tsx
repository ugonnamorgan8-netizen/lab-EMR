import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MetricCard } from "../../components/shared/MetricCard";
import { PageHero } from "../../components/shared/PageHero";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { TurnaroundTimer } from "../../components/shared/TurnaroundTimer";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import type { WorkflowSample } from "../../types/app";
import { formatDate } from "../../utils/formatDate";

const statusActions: Record<string, Array<{ label: string; status: string }>> = {
  COLLECTED: [{ label: "Receive in lab", status: "RECEIVED_LAB" }],
  RECEIVED_LAB: [
    { label: "Send to centrifuge", status: "IN_CENTRIFUGE" },
    { label: "Direct to analysis", status: "IN_ANALYSIS" },
  ],
  IN_CENTRIFUGE: [
    { label: "Aliquot sample", status: "ALIQUOTED" },
    { label: "Direct to analysis", status: "IN_ANALYSIS" },
  ],
  ALIQUOTED: [
    { label: "Send to analysis", status: "IN_ANALYSIS" },
    { label: "Store specimen", status: "STORED" },
  ],
};

export function PreanalyticsQueuePage() {
  const queryClient = useQueryClient();
  const samples = useQuery({
    queryKey: queryKeys.preanalytics(),
    queryFn: async () => {
      const response = await api.get("/workflows/preanalytics");
      return response.data as WorkflowSample[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.patch(`/workflows/samples/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.preanalytics() });
      queryClient.invalidateQueries({ queryKey: queryKeys.processing() });
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      queryClient.invalidateQueries({ queryKey: ["samples"] });
    },
  });

  if (samples.isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (samples.isError || !samples.data) {
    return <EmptyState title="Pre-analytics unavailable" message="The specimen staging queue could not be loaded." />;
  }

  const activeCount = samples.data.length;
  const centrifugeCount = samples.data.filter((sample) => sample.status === "IN_CENTRIFUGE").length;
  const directAnalysisCount = samples.data.filter((sample) => sample.status === "ALIQUOTED").length;

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Specimen Flow"
        title="Pre-analytics queue"
        description="Track tubes from collection to bench readiness with a clean chain of custody through receive, centrifuge, aliquot, and handoff."
        aside={<div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-100">Live queue: {activeCount} samples</div>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Samples in queue" value={activeCount} hint="Collected samples awaiting downstream handling" icon="🧪" variant="blue" />
        <MetricCard label="In centrifuge" value={centrifugeCount} hint="Specimens currently spinning or ready for separation" icon="🌀" variant="violet" />
        <MetricCard label="Ready for analysis" value={directAnalysisCount} hint="Aliquoted samples ready for the processing bench" icon="⚗️" variant="emerald" />
      </div>

      {samples.data.length === 0 ? (
        <EmptyState title="No pre-analytics work pending" message="Collected samples will appear here automatically." />
      ) : (
        <div className="grid gap-4">
          {samples.data.map((sample) => (
            <Card key={sample.id} variant="gradient" className="space-y-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 text-xl text-white shadow">
                    🧪
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{sample.specimenId}</p>
                    <h3 className="mt-1 text-xl font-semibold text-slate-900">
                      {sample.visit.patient.firstName} {sample.visit.patient.lastName}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {sample.visit.visitId} · {sample.specimenType.replaceAll("_", " ")} · {sample.container}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Tests: {sample.testOrders.map((order) => order.testCatalog.code).join(", ")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={sample.visit.urgency} />
                  <StatusBadge status={sample.status} />
                  <TurnaroundTimer
                    registeredAt={sample.visit.registeredAt}
                    tatDeadline={sample.testOrders[0]?.tatDeadline}
                    urgency={sample.visit.urgency}
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                <div className="flex items-center gap-2 rounded-2xl bg-white/60 px-4 py-3 text-sm text-slate-600">
                  <span>📅</span> Collected {formatDate(sample.collectedAt ?? sample.visit.registeredAt)} · Current stage <strong>{sample.status.replaceAll("_", " ")}</strong>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(statusActions[sample.status] ?? []).map((action) => (
                    <Button
                      key={action.status}
                      variant={action.status === "IN_ANALYSIS" ? "primary" : "secondary"}
                      disabled={updateStatus.isPending}
                      onClick={() => updateStatus.mutate({ id: sample.id, status: action.status })}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
