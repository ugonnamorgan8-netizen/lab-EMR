import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "../../components/shared/MetricCard";
import { PageHero } from "../../components/shared/PageHero";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";

type DirectoryPatient = {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  referringDoctor?: string | null;
  clinicalHistory?: string | null;
};

const GENDER_ICON: Record<string, string> = {
  Female: "👩",
  Male: "👨",
};

export function PatientsPage() {
  const patients = useQuery({
    queryKey: queryKeys.patients(),
    queryFn: async () => {
      const response = await api.get("/patients");
      return response.data as DirectoryPatient[];
    },
  });

  if (patients.isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (!patients.data?.length) {
    return <EmptyState title="No patient history yet" message="Patient activity will appear here once visits are created." />;
  }

  const uniquePatients = patients.data;
  const femaleCount = uniquePatients.filter((p) => p.gender === "Female").length;
  const maleCount   = uniquePatients.filter((p) => p.gender === "Male").length;

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Patient Registry"
        title="Patient directory"
        description="A concise operational registry of patients already active in the system, useful for quick verification before registration, billing, or dispatch."
        aside={<div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-100">Patients: {uniquePatients.length}</div>}
      />

      {/* ── Summary metric cards ──────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Registered patients"
          value={uniquePatients.length}
          hint="Distinct patient records already captured by reception"
          icon="👥"
          variant="blue"
        />
        <MetricCard
          label="Female patients"
          value={femaleCount}
          hint="Current female registry count"
          icon="👩"
          variant="rose"
        />
        <MetricCard
          label="Male patients"
          value={maleCount}
          hint="Current male registry count"
          icon="👨"
          variant="indigo"
        />
      </div>

      {/* ── Patient cards ─────────────────────────────────────────────── */}
      <div className="grid gap-4 xl:grid-cols-2">
        {uniquePatients.map((patient) => (
          <Card key={patient.id} variant="gradient" className="space-y-3">
            <div className="flex items-start gap-4">
              {/* Gender avatar */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 text-2xl text-white shadow-md">
                {GENDER_ICON[patient.gender] ?? "🧑"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Lab no: {patient.patientId}
                </p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">
                  {patient.firstName} {patient.lastName}
                </h3>
              </div>
            </div>

            <div className="space-y-1.5 rounded-2xl bg-white/60 p-3 text-sm">
              <p className="flex items-center gap-2 text-slate-600">
                <span>📞</span> {patient.phone} · {patient.gender}
              </p>
              <p className="flex items-center gap-2 text-slate-600">
                <span>🩺</span> Referring doctor: {patient.referringDoctor ?? "Not recorded"}
              </p>
              <p className="flex items-center gap-2 text-slate-600">
                <span>📋</span> Clinical history: {patient.clinicalHistory ?? "Not recorded"}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
