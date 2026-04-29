import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MetricCard } from "../../components/shared/MetricCard";
import { PageHero } from "../../components/shared/PageHero";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import type { ValidationItem } from "../../types/app";
import { formatDate } from "../../utils/formatDate";

export function ValidationQueuePage() {
  const queryClient = useQueryClient();
  const results = useQuery({
    queryKey: queryKeys.validation(),
    queryFn: async () => {
      const response = await api.get("/workflows/validation");
      return response.data as ValidationItem[];
    },
  });

  const validate = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.patch(`/workflows/validation/${orderId}/validate`, {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.validation() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dispatch() });
      queryClient.invalidateQueries({ queryKey: queryKeys.processing() });
      queryClient.invalidateQueries({ queryKey: ["visits"] });
    },
  });

  if (results.isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (results.isError || !results.data) {
    return <EmptyState title="Validation unavailable" message="The scientific review queue could not be loaded." />;
  }

  const statCount = results.data.filter((item) => item.testOrder.urgency === "STAT").length;
  const totalValues = results.data.reduce((sum, item) => sum + item.values.length, 0);

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Scientific Review"
        title="Validation queue"
        description="Review entered results, verify parameter values against reference bands, and promote completed work to report generation."
        aside={<div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-100">Awaiting validation: {results.data.length}</div>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Results awaiting sign-off" value={results.data.length} hint="Entered results ready for scientific review" icon="✅" variant="blue" />
        <MetricCard label="STAT items" value={statCount} hint="High-priority cases requiring immediate review" icon="🚨" variant="rose" />
        <MetricCard label="Parameter values loaded" value={totalValues} hint="Result values currently staged in the queue" icon="🔢" variant="violet" />
      </div>

      {results.data.length === 0 ? (
        <EmptyState title="Validation queue is clear" message="Entered results will appear here for scientific sign-off." />
      ) : (
        <div className="grid gap-4">
          {results.data.map((item) => (
            <Card key={item.id} variant="gradient" className="space-y-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 text-xl text-white shadow">
                    🔬
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{item.testOrder.orderId}</p>
                    <h3 className="mt-1 text-xl font-semibold text-slate-900">
                      {item.testOrder.testCatalog.code} · {item.testOrder.testCatalog.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.testOrder.sample.visit.patient.firstName} {item.testOrder.sample.visit.patient.lastName} · {item.testOrder.sample.visit.visitId}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">Entered {formatDate(item.enteredAt ?? new Date().toISOString())}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={item.testOrder.urgency} />
                  <StatusBadge status={item.status} />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {item.values.map((value) => (
                  <div key={value.id} className="rounded-2xl border border-brand-border bg-white/70 p-3 shadow-sm transition-all duration-200 hover:shadow-md">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{value.parameter.name}</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">
                      {value.value} <span className="text-sm font-normal text-slate-500">{value.parameter.unit}</span>
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{value.flag}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button disabled={validate.isPending} onClick={() => validate.mutate(item.testOrder.id)}>
                  ✅ Validate result
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
