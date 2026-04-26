import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { TurnaroundTimer } from "../../components/shared/TurnaroundTimer";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import { usePatientStore } from "../../stores/patientStore";
import type { VisitSummary } from "../../types/app";

export function QueuePage() {
  const navigate = useNavigate();
  const setActiveVisit = usePatientStore((state) => state.setActiveVisit);
  const visits = useQuery({
    queryKey: queryKeys.visits({}),
    queryFn: async () => {
      const response = await api.get("/visits");
      return response.data as VisitSummary[];
    },
  });

  if (visits.isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!visits.data?.length) {
    return <EmptyState title="No visits in queue" message="Patients registered today will appear here." />;
  }

  return (
    <div className="grid gap-4">
      {visits.data.map((visit) => {
        const firstOrder = visit.samples[0]?.testOrders[0];
        return (
          <Card
            key={visit.id}
            className={`border-l-4 ${visit.urgency === "STAT" ? "border-l-brand-red" : "border-l-brand-blue"}`}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-500">{visit.visitId}</p>
                <p className="text-lg font-semibold text-slate-900">
                  {visit.patient.firstName} {visit.patient.lastName}
                </p>
                <p className="text-sm text-slate-500">{visit.samples.reduce((sum, sample) => sum + sample.testOrders.length, 0)} tests ordered</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={visit.urgency} />
                <StatusBadge status={visit.status} />
                <TurnaroundTimer registeredAt={visit.registeredAt} tatDeadline={firstOrder?.tatDeadline} urgency={visit.urgency} />
                <button
                  className="rounded-lg border border-brand-border px-3 py-2 text-sm font-semibold text-brand-blue"
                  onClick={() => {
                    setActiveVisit(visit);
                    navigate(`/collection/${visit.id}`);
                  }}
                >
                  View visit
                </button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
