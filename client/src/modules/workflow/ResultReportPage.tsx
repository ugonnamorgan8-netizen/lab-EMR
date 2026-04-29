import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { BrandLogo } from "../../components/brand/BrandLogo";
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

// ── Flag badge styling ────────────────────────────────────────────────────────
function FlagBadge({ flag }: { flag: string }) {
  const normalised = flag.toUpperCase().replaceAll(" ", "_");
  const styles: Record<string, string> = {
    NORMAL:          "bg-emerald-50 text-emerald-700 border-emerald-200",
    LOW:             "bg-sky-50 text-sky-700 border-sky-200",
    HIGH:            "bg-amber-50 text-amber-700 border-amber-200",
    CRITICAL_LOW:    "bg-rose-100 text-rose-800 border-rose-300 font-bold",
    CRITICAL_HIGH:   "bg-rose-100 text-rose-800 border-rose-300 font-bold",
    ABNORMAL:        "bg-orange-50 text-orange-700 border-orange-200",
    POSITIVE:        "bg-rose-50 text-rose-700 border-rose-200",
    NEGATIVE:        "bg-emerald-50 text-emerald-700 border-emerald-200",
    INDETERMINATE:   "bg-slate-50 text-slate-600 border-slate-200",
    SEE_NOTE:        "bg-purple-50 text-purple-700 border-purple-200",
  };
  const cls = styles[normalised] ?? "bg-slate-50 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${cls}`}>
      {flag.replaceAll("_", " ")}
    </span>
  );
}

// ── Abnormality indicator dot for rows ───────────────────────────────────────
function RowIndicator({ flag }: { flag: string }) {
  const f = flag.toUpperCase().replaceAll(" ", "_");
  if (f === "NORMAL" || f === "NEGATIVE") return <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />;
  if (f === "CRITICAL_LOW" || f === "CRITICAL_HIGH") return <span className="inline-block h-2 w-2 rounded-full bg-rose-600 animate-pulse" />;
  if (f === "LOW") return <span className="inline-block h-2 w-2 rounded-full bg-sky-400" />;
  if (f === "HIGH" || f === "ABNORMAL") return <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />;
  if (f === "POSITIVE") return <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />;
  return <span className="inline-block h-2 w-2 rounded-full bg-slate-300" />;
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
            body * { visibility: hidden; }
            .print-report, .print-report * { visibility: visible; }
            .print-report {
              position: absolute;
              left: 0; top: 0;
              width: 100%;
              margin: 0; padding: 0;
            }
            .print-actions { display: none !important; }
            .flag-dot { display: none !important; }
          }
        `}
      </style>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="print-actions flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-blue">Patient Result Form</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">{visit.visitId}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
          <Button onClick={() => window.print()}>🖨️ Print report</Button>
        </div>
      </div>

      <Card className="print-report overflow-hidden border-brand-border/80 bg-white p-0">

        {/* ── Header gradient ──────────────────────────────────────────────── */}
        <div className="bg-[linear-gradient(135deg,#0f2f58,#0f5ea8_55%,#5fa8ff)] px-8 py-8 text-white">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <BrandLogo src={logoUrl} alt={lab.name} size="md" className="bg-white/96" imageClassName="h-11 w-11" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/18 text-xl font-bold tracking-[0.2em]">
                  {initials}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-100">Laboratory Report</p>
                <h1 className="mt-2 text-2xl font-semibold">{lab.name}</h1>
                {lab.tagline ? <p className="mt-1 text-sm text-sky-100">{lab.tagline}</p> : null}
                {lab.accreditation ? <p className="mt-1 text-xs text-sky-200/80">🏅 {lab.accreditation}</p> : null}
              </div>
            </div>
            <div className="space-y-1 text-sm text-sky-100 md:text-right">
              {lab.address ? <p>📍 {lab.address}</p> : null}
              {lab.phone ? <p>📞 {lab.phone}</p> : null}
              {lab.email ? <p>✉️ {lab.email}</p> : null}
              {lab.website ? <p>🌐 {lab.website}</p> : null}
              {lab.director ? <p className="mt-2 font-semibold text-white">Dir: {lab.director}</p> : null}
            </div>
          </div>
        </div>

        <div className="space-y-8 px-8 py-8">

          {/* ── Patient + Visit details ──────────────────────────────────────── */}
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[24px] border border-brand-border/70 bg-brand-surface/70 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">👤 Patient details</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">Patient name</p>
                  <p className="font-medium text-slate-900">{visit.patient.firstName} {visit.patient.lastName}</p>
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
                {visit.patient.email ? (
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-medium text-slate-900">{visit.patient.email}</p>
                  </div>
                ) : null}
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
                <div className="mt-4 rounded-xl bg-sky-50/70 p-3 border border-sky-100">
                  <p className="text-xs text-slate-500">Clinical history</p>
                  <p className="mt-1 text-sm text-slate-700">{visit.patient.clinicalHistory}</p>
                </div>
              ) : null}
            </div>

            <div className="rounded-[24px] border border-brand-border/70 bg-white p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">🏥 Visit summary</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Visit reference</span>
                  <span className="font-medium text-slate-900">{visit.visitId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Visit type</span>
                  <span className="font-medium text-slate-900">{visit.type?.replaceAll("_", " ") ?? "—"}</span>
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
                  <span>Samples collected</span>
                  <span className="font-medium text-slate-900">{summary.sampleCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tests ordered</span>
                  <span className="font-medium text-slate-900">{summary.testCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Validated tests</span>
                  <span className="font-medium text-slate-900">{summary.validatedCount} / {summary.testCount}</span>
                </div>
                {visit.report?.generatedAt ? (
                  <div className="flex items-center justify-between">
                    <span>Report generated</span>
                    <span className="font-medium text-slate-900">{formatDate(visit.report.generatedAt)}</span>
                  </div>
                ) : null}
                {visit.report?.dispatchedAt ? (
                  <div className="flex items-center justify-between">
                    <span>Dispatched</span>
                    <span className="font-medium text-slate-900">{formatDate(visit.report.dispatchedAt)}</span>
                  </div>
                ) : null}
                {visit.invoice ? (
                  <div className="border-t border-brand-border/60 pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Invoice</span>
                      <span className="font-medium text-slate-900">{visit.invoice.invoiceId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Invoice status</span>
                      <span className="font-medium text-slate-900">{visit.invoice.status}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total amount</span>
                      <span className="font-medium text-slate-900">{formatCurrency(visit.invoice.totalAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Balance due</span>
                      <span className="font-medium text-slate-900">{formatCurrency(visit.invoice.patientBalance)}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* ── Results legend ───────────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-2 rounded-xl border border-brand-border/50 bg-slate-50/60 px-4 py-3 text-xs">
            <span className="font-semibold text-slate-600 mr-2">Legend:</span>
            {[
              { label: "Normal / Negative", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              { label: "Low", cls: "bg-sky-50 text-sky-700 border-sky-200" },
              { label: "High / Abnormal", cls: "bg-amber-50 text-amber-700 border-amber-200" },
              { label: "Critical", cls: "bg-rose-100 text-rose-800 border-rose-300 font-bold" },
              { label: "Positive", cls: "bg-rose-50 text-rose-700 border-rose-200" },
            ].map((l) => (
              <span key={l.label} className={`inline-flex items-center rounded-full border px-2 py-0.5 ${l.cls}`}>
                {l.label}
              </span>
            ))}
          </div>

          {/* ── Test result tables ───────────────────────────────────────────── */}
          <div className="space-y-6">
            {tests.map((test, index) => (
              <div key={test.id} className="overflow-hidden rounded-[24px] border border-brand-border/80 shadow-sm">
                {/* Test header */}
                <div className="flex flex-col gap-3 bg-[linear-gradient(135deg,rgba(15,94,168,0.07),rgba(95,168,255,0.03))] px-6 py-5 md:flex-row md:items-start md:justify-between border-b border-brand-border/40">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-blue">
                        Test {index + 1}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                        {test.department}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">
                      {test.test.code} — {test.test.name}
                    </h3>
                    <p className="mt-0.5 text-sm text-slate-500">Order: {test.orderId}</p>
                  </div>
                  <div className="space-y-1 text-xs text-slate-600 md:text-right">
                    <p>
                      <span className="text-slate-400">Status: </span>
                      <span className="font-semibold text-slate-800">{test.status.replaceAll("_", " ")}</span>
                    </p>
                    {test.validatedAt ? (
                      <p><span className="text-slate-400">Validated: </span>{formatDate(test.validatedAt)}</p>
                    ) : null}
                    {test.method ? (
                      <p><span className="text-slate-400">Method: </span>{test.method}</p>
                    ) : null}
                    {test.instrument ? (
                      <p><span className="text-slate-400">Instrument: </span>{test.instrument}</p>
                    ) : null}
                  </div>
                </div>

                {/* Results table */}
                <div className="overflow-x-auto px-6 py-5">
                  {test.values.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No result values recorded yet.</p>
                  ) : (
                    <table className="min-w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b-2 border-brand-border/60 text-left text-[10px] uppercase tracking-[0.2em] text-slate-400">
                          <th className="pb-3 pr-3 w-4" />
                          <th className="pb-3 pr-4">Parameter</th>
                          <th className="pb-3 pr-4">Result</th>
                          <th className="pb-3 pr-4">Unit</th>
                          <th className="pb-3 pr-4">Reference range</th>
                          <th className="pb-3 pr-4">Flag</th>
                          <th className="pb-3">Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {test.values.map((value) => {
                          const isAbnormal = !["NORMAL", "NEGATIVE"].includes(
                            value.flag.toUpperCase().replaceAll(" ", "_")
                          );
                          return (
                            <tr
                              key={value.id}
                              className={`border-b border-brand-border/30 last:border-b-0 transition-colors ${isAbnormal ? "bg-amber-50/40" : ""}`}
                            >
                              <td className="py-3 pr-3 flag-dot">
                                <RowIndicator flag={value.flag} />
                              </td>
                              <td className="py-3 pr-4 font-medium text-slate-900">{value.parameterName}</td>
                              <td className={`py-3 pr-4 font-bold ${isAbnormal ? "text-amber-700" : "text-slate-800"}`}>
                                {value.value}
                              </td>
                              <td className="py-3 pr-4 text-slate-500">{value.unit || "—"}</td>
                              <td className="py-3 pr-4 text-slate-500">{value.referenceRange || "—"}</td>
                              <td className="py-3 pr-4">
                                <FlagBadge flag={value.flag} />
                              </td>
                              <td className="py-3 text-xs text-slate-500 italic">
                                {value.flagNote || "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Interpretation / scientist note */}
                {(test.interpretation || test.technicianNote) ? (
                  <div className="grid gap-4 border-t border-brand-border/60 bg-slate-50/70 px-6 py-5 md:grid-cols-2">
                    {test.interpretation ? (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">📋 Interpretation</p>
                        <p className="mt-2 text-sm text-slate-700">{test.interpretation}</p>
                      </div>
                    ) : null}
                    {test.technicianNote ? (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">🔬 Scientist note</p>
                        <p className="mt-2 text-sm text-slate-700">{test.technicianNote}</p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {/* ── Certification footer ──────────────────────────────────────────── */}
          <div className="rounded-[24px] border border-brand-border/70 bg-[linear-gradient(135deg,rgba(15,47,88,0.03),rgba(15,94,168,0.08))] px-6 py-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-blue">Authorised &amp; certified by</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">{lab.director || "Laboratory Supervisor"}</p>
                <p className="mt-1 text-sm text-slate-600">{lab.name}</p>
                {lab.accreditation ? (
                  <p className="mt-1 text-sm text-slate-500">Accreditation No: {lab.accreditation}</p>
                ) : null}
                <div className="mt-4 w-48 border-t-2 border-slate-400" />
                <p className="mt-1 text-xs text-slate-400">Authorised signatory</p>
              </div>
              <div className="max-w-sm space-y-2 text-sm text-slate-600 md:text-right">
                <p>This result form was generated from the laboratory information management system and is ready for printing and patient handover.</p>
                {visit.report?.amendmentNote ? (
                  <p className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-amber-800 text-xs">
                    ⚠️ Amendment: {visit.report.amendmentNote}
                  </p>
                ) : null}
                <p className="text-xs text-slate-400">
                  Generated: {visit.report?.generatedAt ? formatDate(visit.report.generatedAt) : "—"}
                </p>
              </div>
            </div>
          </div>

        </div>
      </Card>
    </div>
  );
}
