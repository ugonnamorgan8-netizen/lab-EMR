import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { MetricCard } from "../../components/shared/MetricCard";
import { PageHero } from "../../components/shared/PageHero";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { TurnaroundTimer } from "../../components/shared/TurnaroundTimer";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import { usePatientStore } from "../../stores/patientStore";
import type { VisitSummary } from "../../types/app";

export function CollectionQueuePage() {
  const navigate = useNavigate();
  const setActiveVisit = usePatientStore((state) => state.setActiveVisit);
  const visits = useQuery({
    queryKey: queryKeys.visits({ status: "REGISTERED" }),
    queryFn: async () => {
      const response = await api.get("/visits", { params: { status: "REGISTERED" } });
      return response.data as VisitSummary[];
    },
  });

  if (!visits.data?.length) {
    return <EmptyState title="No samples awaiting collection" message="Check the queue when patients register." />;
  }

  const statCount = visits.data.filter((v) => v.urgency === "STAT").length;

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Sample Collection"
        title="Collection queue"
        description="Registered patients waiting for sample collection. Open a workspace to draw specimens, select tubes, and move cases downstream."
        aside={<div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-100">Awaiting: {visits.data.length}</div>}
      />

      {/* ── Summary cards ────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Awaiting collection"
          value={visits.data.length}
          hint="Registered visits pending sample draw"
          icon="🧪"
          variant="teal"
        />
        <MetricCard
          label="STAT cases"
          value={statCount}
          hint="High-priority urgent cases in queue"
          icon="🚨"
          variant="rose"
        />
        <MetricCard
          label="Routine cases"
          value={visits.data.length - statCount}
          hint="Standard-priority visits awaiting collection"
          icon="⏱️"
          variant="blue"
        />
      </div>

      {/* ── Visit cards ───────────────────────────────────────────────── */}
      <div className="grid gap-4">
        {visits.data.map((visit) => (
          <Card key={visit.id} variant="gradient">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {/* Patient info with icon */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-700 text-2xl text-white shadow-md">
                  🧪
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{visit.visitId}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {visit.patient.firstName} {visit.patient.lastName}
                  </p>
                  <p className="text-sm text-slate-500">
                    {visit.samples.map((sample) => `${sample.container} × ${sample.testOrders.length}`).join(", ")}
                  </p>
                </div>
              </div>

              {/* Status + timer + action */}
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={visit.urgency} />
                <TurnaroundTimer registeredAt={visit.registeredAt} urgency={visit.urgency} />
                <button
                  className="rounded-xl border border-brand-blue/40 bg-gradient-to-br from-blue-50 to-sky-100 px-4 py-2.5 text-sm font-semibold text-brand-blue shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-0.5"
                  onClick={() => {
                    setActiveVisit(visit);
                    navigate(`/collection/${visit.id}`);
                  }}
                >
                  🔬 Open collection workspace
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
