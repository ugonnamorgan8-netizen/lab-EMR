import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { TurnaroundTimer } from "../../components/shared/TurnaroundTimer";
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

  return (
    <div className="grid gap-4">
      {visits.data.map((visit) => (
        <Card key={visit.id}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-500">{visit.visitId}</p>
              <p className="text-lg font-semibold text-slate-900">
                {visit.patient.firstName} {visit.patient.lastName}
              </p>
              <p className="text-sm text-slate-500">
                {visit.samples.map((sample) => `${sample.container} x ${sample.testOrders.length}`).join(", ")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={visit.urgency} />
              <TurnaroundTimer registeredAt={visit.registeredAt} urgency={visit.urgency} />
              <button
                className="rounded-lg border border-brand-border px-3 py-2 text-sm font-semibold text-brand-blue"
                onClick={() => {
                  setActiveVisit(visit);
                  navigate(`/collection/${visit.id}`);
                }}
              >
                Open collection workspace
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
