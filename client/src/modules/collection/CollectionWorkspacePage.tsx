import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { PageHero } from "../../components/shared/PageHero";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import { formatDate } from "../../utils/formatDate";

type WorkspaceVisit = {
  id: string;
  visitId: string;
  urgency: string;
  status: string;
  patient: {
    firstName: string;
    lastName: string;
    clinicalHistory?: string | null;
  };
  samples: Array<{
    id: string;
    specimenId: string;
    container: string;
    specimenType: string;
    status: string;
    testOrders: Array<{
      id: string;
      testCatalog: {
        name: string;
      };
    }>;
  }>;
};

export function CollectionWorkspacePage() {
  const { visitId } = useParams();
  const queryClient = useQueryClient();
  const visit = useQuery({
    queryKey: queryKeys.visits({ selected: visitId }),
    queryFn: async () => {
      const response = await api.get("/visits");
      return (response.data as WorkspaceVisit[]).find((item) => item.id === visitId);
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
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      queryClient.invalidateQueries({ queryKey: ["samples"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.preanalytics() });
    },
  });

  if (visit.isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (!visit.data) {
    return <EmptyState title="Visit not found" message="Select a valid visit from the collection queue." />;
  }

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Phlebotomy"
        title={`${visit.data.patient.firstName} ${visit.data.patient.lastName}`}
        description={`Collection workspace for ${visit.data.visitId}. Confirm every requested container, collect each specimen, and move the visit into pre-analytics cleanly.`}
        aside={
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={visit.data.urgency} />
            <StatusBadge status={visit.data.status} />
          </div>
        }
      />

      <Card>
        <p className="text-sm text-slate-600">Clinical history: {visit.data.patient.clinicalHistory ?? "Not recorded"}</p>
        <p className="mt-2 text-sm text-slate-500">Collection time defaults to {formatDate(new Date())}</p>
      </Card>

      <div className="grid gap-4">
        {visit.data.samples.map((sample) => (
          <Card key={sample.id} className="space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{sample.specimenId}</p>
                <p className="text-sm text-slate-500">
                  {sample.specimenType.replaceAll("_", " ")} - {sample.container}
                </p>
                <p className="mt-1 text-sm text-slate-600">{sample.testOrders.map((order) => order.testCatalog.name).join(", ")}</p>
              </div>
              <div className="flex flex-col items-start gap-2 md:items-end">
                <StatusBadge status={sample.status} />
                <Button disabled={collectSample.isPending || sample.status === "COLLECTED"} onClick={() => collectSample.mutate(sample.id)}>
                  {sample.status === "COLLECTED" ? "Collected" : "Mark collected"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
