import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import { formatDate } from "../../utils/formatDate";

export function CollectionWorkspacePage() {
  const { visitId } = useParams();
  const queryClient = useQueryClient();
  const visit = useQuery({
    queryKey: queryKeys.visits({ selected: visitId }),
    queryFn: async () => {
      const response = await api.get("/visits");
      return response.data.find((item: { id: string }) => item.id === visitId);
    },
  });

  const collectSample = useMutation({
    mutationFn: async (sampleId: string) => {
      const response = await api.put(`/samples/${sampleId}`, {
        collectedAt: new Date().toISOString(),
        condition: "ACCEPTABLE",
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visits({}) });
      queryClient.invalidateQueries({ queryKey: queryKeys.samples({}) });
    },
  });

  if (!visit.data) {
    return <EmptyState title="Visit not found" message="Select a valid visit from the queue." />;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="space-y-3">
        <div>
          <p className="text-sm text-slate-500">{visit.data.visitId}</p>
          <h3 className="text-lg font-semibold text-slate-900">
            {visit.data.patient.firstName} {visit.data.patient.lastName}
          </h3>
        </div>
        <p className="text-sm text-slate-600">Clinical history: {visit.data.patient.clinicalHistory ?? "Not recorded"}</p>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={visit.data.urgency} />
          <StatusBadge status={visit.data.status} />
        </div>
      </Card>
      <div className="space-y-4">
        {visit.data.samples.map((sample: { id: string; specimenId: string; container: string; specimenType: string; status: string; testOrders: Array<{ id: string; testCatalog: { name: string } }> }) => (
          <Card key={sample.id}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{sample.specimenId}</p>
                <p className="text-sm text-slate-500">
                  {sample.specimenType} • {sample.container}
                </p>
                <p className="mt-1 text-sm text-slate-600">{sample.testOrders.map((order) => order.testCatalog.name).join(", ")}</p>
              </div>
              <div className="flex flex-col items-start gap-2 md:items-end">
                <StatusBadge status={sample.status} />
                <div className="text-xs text-slate-500">Print label and scan workflow placeholder</div>
                <Button onClick={() => collectSample.mutate(sample.id)}>
                  Mark collected
                </Button>
              </div>
            </div>
          </Card>
        ))}
        <Card className="text-sm text-slate-500">Collection time defaults to {formatDate(new Date())}</Card>
      </div>
    </div>
  );
}
