import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";

export function PatientsPage() {
  const patients = useQuery({
    queryKey: queryKeys.patientsSearch(""),
    queryFn: async () => {
      const response = await api.get("/visits");
      return response.data;
    },
  });

  if (!patients.data?.length) {
    return <EmptyState title="No patient history yet" message="Patient activity will appear here once visits are created." />;
  }

  return (
    <div className="grid gap-4">
      {patients.data.map((visit: { id: string; patient: { patientId: string; firstName: string; lastName: string; phone: string } }) => (
        <Card key={visit.id}>
          <p className="font-semibold text-slate-900">
            {visit.patient.firstName} {visit.patient.lastName}
          </p>
          <p className="text-sm text-slate-500">
            {visit.patient.patientId} • {visit.patient.phone}
          </p>
        </Card>
      ))}
    </div>
  );
}
