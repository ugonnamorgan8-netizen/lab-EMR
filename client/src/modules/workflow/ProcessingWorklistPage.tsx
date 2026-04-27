import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MetricCard } from "../../components/shared/MetricCard";
import { PageHero } from "../../components/shared/PageHero";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { TurnaroundTimer } from "../../components/shared/TurnaroundTimer";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { Textarea } from "../../components/ui/Textarea";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import type { ProcessingOrder } from "../../types/app";
import { formatDate } from "../../utils/formatDate";

export function ProcessingWorklistPage() {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const orders = useQuery({
    queryKey: queryKeys.processing(),
    queryFn: async () => {
      const response = await api.get("/workflows/processing");
      return response.data as ProcessingOrder[];
    },
  });

  const startAnalysis = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.patch(`/workflows/processing/${orderId}/start`, {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.processing() });
      queryClient.invalidateQueries({ queryKey: queryKeys.preanalytics() });
      queryClient.invalidateQueries({ queryKey: ["visits"] });
    },
  });

  const enterResult = useMutation({
    mutationFn: async ({ orderId, technicianNote }: { orderId: string; technicianNote?: string }) => {
      const response = await api.post(`/workflows/processing/${orderId}/result`, {
        technicianNote,
        method: "Automated bench entry",
        instrument: "Core analyzer",
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.processing() });
      queryClient.invalidateQueries({ queryKey: queryKeys.validation() });
      queryClient.invalidateQueries({ queryKey: ["visits"] });
    },
  });

  if (orders.isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (orders.isError || !orders.data) {
    return <EmptyState title="Processing unavailable" message="The analysis worklist could not be loaded." />;
  }

  const pending = orders.data.filter((order) => order.status === "PENDING").length;
  const inAnalysis = orders.data.filter((order) => order.status === "IN_ANALYSIS").length;
  const resulted = orders.data.filter((order) => order.status === "RESULTED").length;

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Bench Operations"
        title="Processing worklist"
        description="Move specimens from queued analysis into resulted output with fast status control, analyte previews, and TAT-aware prioritisation."
        aside={<div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-100">In analysis: {inAnalysis}</div>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Pending tests" value={pending} hint="Orders not yet started on the bench" />
        <MetricCard label="In analysis" value={inAnalysis} hint="Orders currently under active bench work" />
        <MetricCard label="Ready for review" value={resulted} hint="Orders that have entered results and can move to validation" />
      </div>

      {orders.data.length === 0 ? (
        <EmptyState title="No processing worklist items" message="Orders will appear here once samples reach the bench." />
      ) : (
        <div className="grid gap-4">
          {orders.data.map((order) => (
            <Card key={order.id} className="space-y-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-3xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{order.orderId}</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">
                    {order.testCatalog.code} · {order.testCatalog.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {order.sample.visit.patient.firstName} {order.sample.visit.patient.lastName} · {order.sample.visit.visitId} · {order.testCatalog.department}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Specimen {order.sample.specimenId} · registered {formatDate(order.sample.visit.registeredAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={order.urgency} />
                  <StatusBadge status={order.status} />
                  <TurnaroundTimer
                    registeredAt={order.sample.visit.registeredAt}
                    tatDeadline={order.tatDeadline}
                    urgency={order.urgency}
                  />
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">Analyte map</p>
                  <div className="mt-3 space-y-2">
                    {order.testCatalog.parameters.map((parameter) => {
                      const range = parameter.referenceRanges[0];
                      return (
                        <div key={parameter.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm">
                          <span className="text-slate-700">{parameter.name}</span>
                          <span className="text-slate-500">
                            {range?.normalLow ?? "-"} to {range?.normalHigh ?? "-"} {parameter.unit}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  {order.result?.values?.length ? (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                      <p className="text-sm font-semibold text-emerald-800">Captured result preview</p>
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        {order.result.values.map((value) => (
                          <div key={value.id} className="rounded-xl bg-white px-3 py-2 text-sm">
                            <p className="font-medium text-slate-800">{value.parameter.name}</p>
                            <p className="text-slate-500">
                              {value.value} {value.parameter.unit} · {value.flag}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <Textarea
                    label="Technician note"
                    value={notes[order.id] ?? ""}
                    onChange={(event) => setNotes((current) => ({ ...current, [order.id]: event.target.value }))}
                    placeholder="Instrument note, rerun detail, dilution remark..."
                  />

                  <div className="flex flex-wrap gap-2">
                    <Button disabled={order.status !== "PENDING" || startAnalysis.isPending} onClick={() => startAnalysis.mutate(order.id)}>
                      Start analysis
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={![ "PENDING", "IN_ANALYSIS" ].includes(order.status) || enterResult.isPending}
                      onClick={() =>
                        enterResult.mutate({
                          orderId: order.id,
                          technicianNote: notes[order.id],
                        })
                      }
                    >
                      Auto-enter result
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
