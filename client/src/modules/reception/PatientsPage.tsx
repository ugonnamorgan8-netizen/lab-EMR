import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "../../components/shared/MetricCard";
import { PageHero } from "../../components/shared/PageHero";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";

type PatientVisitRecord = {
  id: string;
  patient: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
    phone: string;
    gender: string;
    referringDoctor?: string | null;
    clinicalHistory?: string | null;
  };
};

export function PatientsPage() {
  const patients = useQuery({
    queryKey: queryKeys.patientsSearch(""),
    queryFn: async () => {
      const response = await api.get("/visits");
      return response.data as PatientVisitRecord[];
    },
  });

  if (patients.isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (!patients.data?.length) {
    return <EmptyState title="No patient history yet" message="Patient activity will appear here once visits are created." />;
  }

  const uniquePatients = Array.from(
    new Map(patients.data.map((visit) => [visit.patient.id, visit.patient])).values(),
  );

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Patient Registry"
        title="Patient directory"
        description="A concise operational registry of patients already active in the system, useful for quick verification before registration, billing, or dispatch."
        aside={<div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-100">Patients: {uniquePatients.length}</div>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Registered patients" value={uniquePatients.length} hint="Distinct patient records already linked to visits" />
        <MetricCard label="Female patients" value={uniquePatients.filter((patient) => patient.gender === "Female").length} hint="Current female registry count" />
        <MetricCard label="Male patients" value={uniquePatients.filter((patient) => patient.gender === "Male").length} hint="Current male registry count" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {uniquePatients.map((patient) => (
          <Card key={patient.id} className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{patient.patientId}</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">
                {patient.firstName} {patient.lastName}
              </h3>
            </div>
            <p className="text-sm text-slate-500">{patient.phone} - {patient.gender}</p>
            <p className="text-sm text-slate-600">Referring doctor: {patient.referringDoctor ?? "Not recorded"}</p>
            <p className="text-sm text-slate-600">Clinical history: {patient.clinicalHistory ?? "Not recorded"}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
