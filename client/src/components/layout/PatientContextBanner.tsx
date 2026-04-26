import { usePatientStore } from "../../stores/patientStore";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

export function PatientContextBanner() {
  const activeVisit = usePatientStore((state) => state.activeVisit);
  const setActiveVisit = usePatientStore((state) => state.setActiveVisit);

  if (!activeVisit) {
    return null;
  }

  const patient = activeVisit.patient;

  return (
    <div className="sticky top-0 z-20 border-b border-brand-border bg-white px-4 py-3">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="font-semibold text-slate-900">
          {patient.firstName} {patient.lastName}
        </div>
        <div className="text-slate-600">{patient.patientId}</div>
        <div className="text-slate-600">{activeVisit.visitId}</div>
        {activeVisit.urgency === "STAT" ? <Badge className="bg-red-100 text-brand-red">⚡ STAT</Badge> : null}
        {patient.referringDoctor ? <div className="text-slate-500">{patient.referringDoctor}</div> : null}
        {patient.allergies.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {patient.allergies.map((allergy) => (
              <Badge key={allergy} className="bg-red-100 text-brand-red">
                {allergy}
              </Badge>
            ))}
          </div>
        ) : null}
        <Button variant="ghost" className="ml-auto px-2" onClick={() => setActiveVisit(null)}>
          <span aria-hidden="true">✕</span>
        </Button>
      </div>
    </div>
  );
}
