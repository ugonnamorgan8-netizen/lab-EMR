import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MetricCard } from "../../components/shared/MetricCard";
import { PageHero } from "../../components/shared/PageHero";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { TurnaroundTimer } from "../../components/shared/TurnaroundTimer";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
import { Textarea } from "../../components/ui/Textarea";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import type { ProcessingOrder } from "../../types/app";
import { formatDate } from "../../utils/formatDate";

const RESULT_FLAGS = [
  "NORMAL",
  "LOW",
  "HIGH",
  "CRITICAL_LOW",
  "CRITICAL_HIGH",
  "ABNORMAL",
  "POSITIVE",
  "NEGATIVE",
  "INDETERMINATE",
  "SEE_NOTE",
] as const;

type DraftValue = {
  value: string;
  flag: (typeof RESULT_FLAGS)[number];
  flagNote: string;
};

type ResultDraft = {
  values: Record<string, DraftValue>;
  interpretation: string;
  method: string;
  instrument: string;
  technicianNote: string;
  amendmentNote: string;
};

function buildDraft(order: ProcessingOrder): ResultDraft {
  return {
    values: Object.fromEntries(
      order.testCatalog.parameters.map((parameter) => {
        const existingValue = order.result?.values.find((value) => value.parameter.id === parameter.id);
        return [
          parameter.id,
          {
            value: existingValue?.value ?? "",
            flag: (existingValue?.flag as DraftValue["flag"] | undefined) ?? "NORMAL",
            flagNote: existingValue?.flagNote ?? "",
          },
        ];
      }),
    ),
    interpretation: order.result?.interpretation ?? "",
    method: order.result?.method ?? "",
    instrument: order.result?.instrument ?? "",
    technicianNote: order.result?.technicianNote ?? "",
    amendmentNote: "",
  };
}

function midpointValue(low?: number | null, high?: number | null) {
  if (low == null && high == null) {
    return "";
  }

  if (low != null && high != null) {
    const midpoint = (low + high) / 2;
    return Number.isInteger(midpoint) ? String(midpoint) : midpoint.toFixed(1);
  }

  return String(low ?? high ?? "");
}

function isDraftComplete(order: ProcessingOrder, draft: ResultDraft) {
  return order.testCatalog.parameters.every((parameter) => draft.values[parameter.id]?.value.trim());
}

function parseNumericValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function ProcessingWorklistPage() {
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, ResultDraft>>({});
  const orders = useQuery({
    queryKey: queryKeys.processing(),
    queryFn: async () => {
      const response = await api.get("/workflows/processing");
      return response.data as ProcessingOrder[];
    },
  });

  const startAnalysis = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.patch(`/workflows/processing/${orderId}/start`, {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.processing() });
      queryClient.invalidateQueries({ queryKey: queryKeys.preanalytics() });
      queryClient.invalidateQueries({ queryKey: ["visits"] });
    },
  });

  const saveResult = useMutation({
    mutationFn: async ({ order, draft }: { order: ProcessingOrder; draft: ResultDraft }) => {
      const payload = {
        values: order.testCatalog.parameters.map((parameter) => ({
          parameterId: parameter.id,
          value: draft.values[parameter.id]?.value.trim() ?? "",
          numericValue: parseNumericValue(draft.values[parameter.id]?.value ?? ""),
          flag: draft.values[parameter.id]?.flag ?? "NORMAL",
          flagNote: draft.values[parameter.id]?.flagNote.trim() || undefined,
        })),
        interpretation: draft.interpretation.trim() || undefined,
        method: draft.method.trim() || undefined,
        instrument: draft.instrument.trim() || undefined,
        technicianNote: draft.technicianNote.trim() || undefined,
      };

      if (order.result) {
        const response = await api.patch(`/workflows/results/${order.result.id}/amend`, {
          ...payload,
          amendmentNote: draft.amendmentNote.trim(),
        });
        return response.data;
      }

      const response = await api.post(`/workflows/processing/${order.id}/result-manual`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.processing() });
      queryClient.invalidateQueries({ queryKey: queryKeys.validation() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dispatch() });
      queryClient.invalidateQueries({ queryKey: ["visits"] });
    },
  });

  function getDraft(order: ProcessingOrder) {
    return drafts[order.id] ?? buildDraft(order);
  }

  function updateDraft(order: ProcessingOrder, updater: (current: ResultDraft) => ResultDraft) {
    setDrafts((current) => ({
      ...current,
      [order.id]: updater(current[order.id] ?? buildDraft(order)),
    }));
  }

  function prefillMidpoint(order: ProcessingOrder) {
    updateDraft(order, (current) => ({
      ...current,
      values: Object.fromEntries(
        order.testCatalog.parameters.map((parameter) => {
          const range = parameter.referenceRanges[0];
          return [
            parameter.id,
            {
              value: midpointValue(range?.normalLow, range?.normalHigh),
              flag: "NORMAL",
              flagNote: "",
            },
          ];
        }),
      ),
    }));
  }

  if (orders.isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (orders.isError || !orders.data) {
    return <EmptyState title="Processing unavailable" message="The analysis worklist could not be loaded." />;
  }

  const pending = orders.data.filter((order) => order.status === "PENDING").length;
  const inAnalysis = orders.data.filter((order) => order.status === "IN_ANALYSIS").length;
  const resulted = orders.data.filter((order) => order.status === "RESULTED").length;

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Bench Operations"
        title="Scientist result workspace"
        description="Capture complete analyte results, amend them when needed, and move every bench order cleanly into scientific validation and patient-ready reporting."
        aside={<div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-slate-100">In analysis: {inAnalysis}</div>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Pending tests" value={pending} hint="Orders not yet started on the bench" />
        <MetricCard label="In analysis" value={inAnalysis} hint="Orders currently under active bench work" />
        <MetricCard label="Ready for review" value={resulted} hint="Orders with results that can move to validation" />
      </div>

      {orders.data.length === 0 ? (
        <EmptyState title="No processing worklist items" message="Orders will appear here once samples reach the bench." />
      ) : (
        <div className="grid gap-4">
          {orders.data.map((order) => {
            const draft = getDraft(order);
            const draftComplete = isDraftComplete(order, draft);
            const requiresAmendmentNote = Boolean(order.result);

            return (
              <Card key={order.id} className="space-y-5 border-brand-border/70 bg-white/95">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="max-w-3xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{order.orderId}</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-900">
                      {order.testCatalog.code} / {order.testCatalog.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {order.sample.visit.patient.firstName} {order.sample.visit.patient.lastName} / {order.sample.visit.visitId} / {order.testCatalog.department}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Specimen {order.sample.specimenId} / registered {formatDate(order.sample.visit.registeredAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={order.urgency} />
                    <StatusBadge status={order.status} />
                    <TurnaroundTimer registeredAt={order.sample.visit.registeredAt} tatDeadline={order.tatDeadline} urgency={order.urgency} />
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                  <div className="space-y-4 rounded-[24px] border border-brand-border/80 bg-brand-surface/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Analyte result entry</p>
                        <p className="mt-1 text-xs text-slate-500">Enter every parameter, adjust flags where needed, then save for validation.</p>
                      </div>
                      <Button variant="secondary" className="shrink-0" onClick={() => prefillMidpoint(order)}>
                        Prefill midpoint
                      </Button>
                    </div>

                    <div className="grid gap-3">
                      {order.testCatalog.parameters.map((parameter) => {
                        const range = parameter.referenceRanges[0];
                        const valueDraft = draft.values[parameter.id];

                        return (
                          <div key={parameter.id} className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
                            <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
                              <Input
                                label={parameter.name}
                                value={valueDraft?.value ?? ""}
                                onChange={(event) =>
                                  updateDraft(order, (current) => ({
                                    ...current,
                                    values: {
                                      ...current.values,
                                      [parameter.id]: {
                                        ...current.values[parameter.id],
                                        value: event.target.value,
                                      },
                                    },
                                  }))
                                }
                                placeholder={`Enter value in ${parameter.unit || "reported units"}`}
                              />

                              <label className="flex flex-col gap-2 text-sm text-slate-700">
                                <span className="font-medium">Flag</span>
                                <select
                                  className="min-h-11 rounded-lg border border-brand-border bg-white px-3 py-2"
                                  value={valueDraft?.flag ?? "NORMAL"}
                                  onChange={(event) =>
                                    updateDraft(order, (current) => ({
                                      ...current,
                                      values: {
                                        ...current.values,
                                        [parameter.id]: {
                                          ...current.values[parameter.id],
                                          flag: event.target.value as DraftValue["flag"],
                                        },
                                      },
                                    }))
                                  }
                                >
                                  {RESULT_FLAGS.map((flag) => (
                                    <option key={flag} value={flag}>
                                      {flag.replaceAll("_", " ")}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </div>

                            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                              <Input
                                label="Flag note"
                                value={valueDraft?.flagNote ?? ""}
                                onChange={(event) =>
                                  updateDraft(order, (current) => ({
                                    ...current,
                                    values: {
                                      ...current.values,
                                      [parameter.id]: {
                                        ...current.values[parameter.id],
                                        flagNote: event.target.value,
                                      },
                                    },
                                  }))
                                }
                                placeholder="Optional note for abnormal or qualitative findings"
                              />
                              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                <p className="font-medium text-slate-700">Reference</p>
                                <p className="mt-1">
                                  {(range?.normalLow ?? "-") as string | number} to {(range?.normalHigh ?? "-") as string | number} {parameter.unit}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        label="Method"
                        value={draft.method}
                        onChange={(event) => updateDraft(order, (current) => ({ ...current, method: event.target.value }))}
                        placeholder="Method or bench procedure"
                      />
                      <Input
                        label="Instrument"
                        value={draft.instrument}
                        onChange={(event) => updateDraft(order, (current) => ({ ...current, instrument: event.target.value }))}
                        placeholder="Analyzer or manual setup"
                      />
                    </div>

                    <Textarea
                      label="Interpretation"
                      value={draft.interpretation}
                      onChange={(event) => updateDraft(order, (current) => ({ ...current, interpretation: event.target.value }))}
                      placeholder="Clinical interpretation or summary statement"
                    />

                    <Textarea
                      label="Scientist note"
                      value={draft.technicianNote}
                      onChange={(event) => updateDraft(order, (current) => ({ ...current, technicianNote: event.target.value }))}
                      placeholder="Bench remarks, rerun details, dilution notes, observations..."
                    />

                    {requiresAmendmentNote ? (
                      <Textarea
                        label="Reason for edit"
                        value={draft.amendmentNote}
                        onChange={(event) => updateDraft(order, (current) => ({ ...current, amendmentNote: event.target.value }))}
                        placeholder="Explain what changed and why this result was amended"
                      />
                    ) : null}

                    {order.result?.values?.length ? (
                      <div className="rounded-[24px] border border-sky-100 bg-sky-50/80 p-4">
                        <p className="text-sm font-semibold text-sky-900">Current saved result</p>
                        <div className="mt-3 grid gap-2 md:grid-cols-2">
                          {order.result.values.map((value) => (
                            <div key={value.id} className="rounded-xl bg-white px-3 py-2 text-sm">
                              <p className="font-medium text-slate-800">{value.parameter.name}</p>
                              <p className="text-slate-500">
                                {value.value} {value.parameter.unit} / {value.flag.replaceAll("_", " ")}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                      <Button disabled={order.status !== "PENDING" || startAnalysis.isPending} onClick={() => startAnalysis.mutate(order.id)}>
                        Start analysis
                      </Button>
                      <Button
                        variant="secondary"
                        disabled={!draftComplete || saveResult.isPending || (requiresAmendmentNote && !draft.amendmentNote.trim())}
                        onClick={() => saveResult.mutate({ order, draft })}
                      >
                        {order.result ? "Save amendment" : "Save result"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
