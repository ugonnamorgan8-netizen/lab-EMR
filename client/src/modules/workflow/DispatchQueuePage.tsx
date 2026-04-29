import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { MetricCard } from "../../components/shared/MetricCard";
import { PageHero } from "../../components/shared/PageHero";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import type { DispatchVisit } from "../../types/app";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

export function DispatchQueuePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const visits = useQuery({
    queryKey: queryKeys.dispatch(),
    queryFn: async () => {
      const response = await api.get("/workflows/dispatch");
      return response.data as DispatchVisit[];
    },
  });

  const generateReport = useMutation({
    mutationFn: async (visitId: string) => {
      const response = await api.post(`/workflows/dispatch/${visitId}/generate`, {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dispatch() });
      queryClient.invalidateQueries({ queryKey: ["visits"] });
    },
  });

  const dispatchReport = useMutation({
    mutationFn: async ({ visitId, deliveryMethod }: { visitId: string; deliveryMethod: string }) => {
      const response = await api.post(`/workflows/dispatch/${visitId}/dispatch`, { deliveryMethod });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dispatch() });
      queryClient.invalidateQueries({ queryKey: ["visits"] });
    },
  });

  if (visits.isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (visits.isError || !visits.data) {
    return <EmptyState title="Dispatch unavailable" message="The report dispatch queue could not be loaded." />;
  }

  const generated = visits.data.filter((visit) => visit.report?.status === "GENERATED").length;
  const dispatched = visits.data.filter(
    (visit) => visit.report?.status === "DISPATCHED" || visit.status === "DISPATCHED",
  ).length;

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Report Release"
        title="Dispatch queue"
        description="Generate patient-ready reports from validated work and complete delivery through print or electronic release without losing billing context."
        aside={<div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-100">Ready visits: {visits.data.length}</div>}
      />

      {/* ── Dispatch summary cards ───────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Ready for dispatch"
          value={visits.data.length}
          hint="Validated or report-generated visits in the release queue"
          icon="📤"
          variant="blue"
        />
        <MetricCard
          label="Generated reports"
          value={generated}
          hint="Reports ready for final handoff"
          icon="📄"
          variant="emerald"
        />
        <MetricCard
          label="Already dispatched"
          value={dispatched}
          hint="Completed releases kept for traceability"
          icon="✅"
          variant="violet"
        />
      </div>

      {/* ── Visit cards ───────────────────────────────────────────────── */}
      {visits.data.length === 0 ? (
        <EmptyState title="No dispatch work pending" message="Validated visits will appear here once reports are ready." />
      ) : (
        <div className="grid gap-4">
          {visits.data.map((visit) => (
            <Card key={visit.id} variant="gradient" className="space-y-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-2xl text-white shadow-md">
                    📤
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{visit.visitId}</p>
                    <h3 className="mt-1 text-xl font-semibold text-slate-900">
                      {visit.patient.firstName} {visit.patient.lastName}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {visit.samples.reduce((sum, sample) => sum + sample.testOrders.length, 0)} tests · Balance {formatCurrency(visit.invoice?.patientBalance ?? 0)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={visit.urgency} />
                  <StatusBadge status={visit.report?.status ?? visit.status} />
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
                <div className="space-y-2 rounded-2xl bg-white/60 p-4 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <span>📅</span> Registered {formatDate(visit.registeredAt)}
                  </p>
                  <p className="flex items-center gap-2">
                    <span>📄</span> Report: {visit.report?.generatedAt ? `generated ${formatDate(visit.report.generatedAt)}` : "not generated yet"}
                  </p>
                  <p className="flex items-center gap-2">
                    <span>📮</span> Dispatch: {visit.report?.dispatchedAt ? formatDate(visit.report.dispatchedAt) : "awaiting release"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost" onClick={() => navigate(`/reports/visit/${visit.id}`)}>
                    🖨️ Open print view
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={
                      generateReport.isPending ||
                      visit.report?.status === "GENERATED" ||
                      visit.report?.status === "DISPATCHED"
                    }
                    onClick={() => generateReport.mutate(visit.id)}
                  >
                    📝 Generate report
                  </Button>
                  <Button
                    disabled={dispatchReport.isPending || visit.report?.status === "DISPATCHED"}
                    onClick={() => dispatchReport.mutate({ visitId: visit.id, deliveryMethod: "PRINT" })}
                  >
                    🚀 Dispatch report
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
