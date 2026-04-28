import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import type { ResultReportResponse } from "../../types/app";
import { getBrandInitials, getBrandLogoUrl } from "../../utils/branding";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

function getAgeLabel(dateOfBirth: string) {
  const birthDate = new Date(dateOfBirth);
  const now = new Date();
  let years = now.getFullYear() - birthDate.getFullYear();
  const monthDifference = now.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && now.getDate() < birthDate.getDate())) {
    years -= 1;
  }

  return `${years} yrs`;
}

export function ResultReportPage() {
  const navigate = useNavigate();
  const { visitId } = useParams();
  const reportQuery = useQuery({
    queryKey: queryKeys.visitResults(visitId ?? ""),
    enabled: Boolean(visitId),
    queryFn: async () => {
      const response = await api.get(`/workflows/visits/${visitId}/results`);
      return response.data as ResultReportResponse;
    },
  });

  if (reportQuery.isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (reportQuery.isError || !reportQuery.data) {
    return <EmptyState title="Result form unavailable" message="The printable result form could not be loaded." />;
  }

  const { lab, visit, tests, summary } = reportQuery.data;
  const logoUrl = getBrandLogoUrl(lab.logoUrl);
  const initials = getBrandInitials(lab.name);

  return (
    <div className="space-y-4">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }

            .print-report,
            .print-report * {
              visibility: visible;
            }

            .print-report {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 0;
            }

            .print-actions {
              display: none !important;
            }
          }
        `}
      </style>

      <div className="print-actions flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-blue">Patient Result Form</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">{visit.visitId}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button onClick={() => window.print()}>Print report</Button>
        </div>
      </div>

      <Card className="print-report overflow-hidden border-brand-border/80 bg-white p-0">
        <div className="bg-[linear-gradient(135deg,#0f2f58,#0f5ea8_55%,#5fa8ff)] px-8 py-8 text-white">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <img src={logoUrl} alt={lab.name} className="h-16 w-16 rounded-2xl bg-white/92 object-contain p-1.5 shadow-[0_12px_24px_rgba(15,47,88,0.12)]" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/18 text-xl font-bold tracking-[0.2em]">
                  {initials}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-100">Laboratory Report</p>
                <h1 className="mt-2 text-2xl font-semibold">{lab.name}</h1>
                {lab.tagline ? <p className="mt-1 text-sm text-sky-100">{lab.tagline}</p> : null}
              </div>
            </div>
            <div className="space-y-1 text-sm text-sky-100 md:text-right">
              {lab.address ? <p>{lab.address}</p> : null}
              {lab.phone ? <p>{lab.phone}</p> : null}
              {lab.accreditation ? <p>{lab.accreditation}</p> : null}
            </div>
          </div>
        </div>

        <div className="space-y-8 px-8 py-8">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[24px] border border-brand-border/70 bg-brand-surface/70 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">Patient details</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">Patient name</p>
                  <p className="font-medium text-slate-900">
                    {visit.patient.firstName} {visit.patient.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Patient ID</p>
                  <p className="font-medium text-slate-900">{visit.patient.patientId}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Age / Gender</p>
                  <p className="font-medium text-slate-900">
                    {getAgeLabel(visit.patient.dateOfBirth)} / {visit.patient.gender}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="font-medium text-slate-900">{visit.patient.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Referring doctor</p>
                  <p className="font-medium text-slate-900">{visit.patient.referringDoctor || "Not recorded"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Referring facility</p>
                  <p className="font-medium text-slate-900">{visit.patient.referringFacility || "Not recorded"}</p>
                </div>
              </div>
              {visit.patient.clinicalHistory ? (
                <div className="mt-4">
                  <p className="text-xs text-slate-500">Clinical history</p>
                  <p className="mt-1 text-sm text-slate-700">{visit.patient.clinicalHistory}</p>
                </div>
              ) : null}
            </div>

            <div className="rounded-[24px] border border-brand-border/70 bg-white p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">Visit summary</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Visit reference</span>
                  <span className="font-medium text-slate-900">{visit.visitId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Registered</span>
                  <span className="font-medium text-slate-900">{formatDate(visit.registeredAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Urgency</span>
                  <span className="font-medium text-slate-900">{visit.urgency.replaceAll("_", " ")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Validated tests</span>
                  <span className="font-medium text-slate-900">
                    {summary.validatedCount} / {summary.testCount}
                  </span>
                </div>
                {visit.report?.generatedAt ? (
                  <div className="flex items-center justify-between">
                    <span>Generated</span>
                    <span className="font-medium text-slate-900">{formatDate(visit.report.generatedAt)}</span>
                  </div>
                ) : null}
                {visit.invoice ? (
                  <div className="border-t border-brand-border/60 pt-3">
                    <div className="flex items-center justify-between">
                      <span>Invoice</span>
                      <span className="font-medium text-slate-900">{visit.invoice.invoiceId}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span>Balance</span>
                      <span className="font-medium text-slate-900">{formatCurrency(visit.invoice.patientBalance)}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {tests.map((test, index) => (
              <div key={test.id} className="overflow-hidden rounded-[24px] border border-brand-border/80">
                <div className="flex flex-col gap-3 bg-[linear-gradient(135deg,rgba(15,94,168,0.08),rgba(95,168,255,0.04))] px-6 py-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue">Test {index + 1}</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">
                      {test.test.code} / {test.test.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {test.department} / {test.orderId}
                    </p>
                  </div>
                  <div className="space-y-1 text-sm text-slate-600 md:text-right">
                    <p>Status: {test.status.replaceAll("_", " ")}</p>
                    {test.validatedAt ? <p>Validated: {formatDate(test.validatedAt)}</p> : null}
                    {test.method ? <p>Method: {test.method}</p> : null}
                    {test.instrument ? <p>Instrument: {test.instrument}</p> : null}
                  </div>
                </div>

                <div className="overflow-x-auto px-6 py-5">
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-brand-border/80 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                        <th className="pb-3 pr-4">Parameter</th>
                        <th className="pb-3 pr-4">Result</th>
                        <th className="pb-3 pr-4">Unit</th>
                        <th className="pb-3 pr-4">Reference range</th>
                        <th className="pb-3">Flag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {test.values.map((value) => (
                        <tr key={value.id} className="border-b border-brand-border/40 last:border-b-0">
                          <td className="py-3 pr-4 font-medium text-slate-900">{value.parameterName}</td>
                          <td className="py-3 pr-4 text-slate-800">{value.value}</td>
                          <td className="py-3 pr-4 text-slate-600">{value.unit || "-"}</td>
                          <td className="py-3 pr-4 text-slate-600">{value.referenceRange || "-"}</td>
                          <td className="py-3 text-slate-700">{value.flag.replaceAll("_", " ")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {test.interpretation || test.technicianNote ? (
                  <div className="grid gap-4 border-t border-brand-border/60 bg-slate-50/70 px-6 py-5 md:grid-cols-2">
                    {test.interpretation ? (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Interpretation</p>
                        <p className="mt-2 text-sm text-slate-700">{test.interpretation}</p>
                      </div>
                    ) : null}
                    {test.technicianNote ? (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Scientist note</p>
                        <p className="mt-2 text-sm text-slate-700">{test.technicianNote}</p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="rounded-[24px] border border-brand-border/70 bg-[linear-gradient(135deg,rgba(15,47,88,0.03),rgba(15,94,168,0.08))] px-6 py-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-blue">Certified by</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">{lab.director || "Laboratory Supervisor"}</p>
                <p className="mt-1 text-sm text-slate-600">{lab.name}</p>
                {lab.accreditation ? <p className="mt-1 text-sm text-slate-500">Accreditation: {lab.accreditation}</p> : null}
              </div>
              <div className="max-w-sm text-sm text-slate-600 md:text-right">
                <p>This result form was generated from the laboratory EMR and is ready for printing and patient handover.</p>
                {visit.report?.amendmentNote ? <p className="mt-2 text-brand-blue">Amendment note: {visit.report.amendmentNote}</p> : null}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
