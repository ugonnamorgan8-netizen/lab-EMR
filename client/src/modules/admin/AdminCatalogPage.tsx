import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PageHero } from "../../components/shared/PageHero";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import { useAuthStore } from "../../stores/authStore";
import type { AdminCatalogResponse } from "../../types/app";
import { formatCurrency } from "../../utils/formatCurrency";

type CatalogDraft = {
  department: string;
  price: string;
  active: string;
};

type ParameterDraft = {
  name: string;
  unit: string;
  sortOrder: string;
};

type ReferenceRangeDraft = {
  gender: string;
  ageMinYears: string;
  ageMaxYears: string;
  normalLow: string;
  normalHigh: string;
  criticalLow: string;
  criticalHigh: string;
  unit: string;
};

function numberToDraft(value?: number | null) {
  return value == null ? "" : String(value);
}

function buildParameterDraft(parameter: AdminCatalogResponse["tests"][number]["parameters"][number]): ParameterDraft {
  return {
    name: parameter.name,
    unit: parameter.unit,
    sortOrder: String(parameter.sortOrder),
  };
}

function buildReferenceRangeDraft(
  range: AdminCatalogResponse["tests"][number]["parameters"][number]["referenceRanges"][number],
): ReferenceRangeDraft {
  return {
    gender: range.gender ?? "",
    ageMinYears: numberToDraft(range.ageMinYears),
    ageMaxYears: numberToDraft(range.ageMaxYears),
    normalLow: numberToDraft(range.normalLow),
    normalHigh: numberToDraft(range.normalHigh),
    criticalLow: numberToDraft(range.criticalLow),
    criticalHigh: numberToDraft(range.criticalHigh),
    unit: range.unit,
  };
}

function buildNewParameterDraft(sortOrder: number): ParameterDraft {
  return {
    name: "",
    unit: "",
    sortOrder: String(sortOrder),
  };
}

function buildNewReferenceRangeDraft(unit: string): ReferenceRangeDraft {
  return {
    gender: "",
    ageMinYears: "",
    ageMaxYears: "",
    normalLow: "",
    normalHigh: "",
    criticalLow: "",
    criticalHigh: "",
    unit,
  };
}

function parseOptionalNumber(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseOptionalInteger(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}

function parseSortOrder(value: string) {
  if (!value.trim()) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function rangeSummary(range: AdminCatalogResponse["tests"][number]["parameters"][number]["referenceRanges"][number]) {
  const audience = range.gender || "All genders";
  const minAge = range.ageMinYears == null ? "any" : `${range.ageMinYears}+`;
  const maxAge = range.ageMaxYears == null ? "any" : `${range.ageMaxYears}`;
  return `${audience} / ${minAge}-${maxAge} yrs`;
}

export function AdminCatalogPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [drafts, setDrafts] = useState<Record<string, CatalogDraft>>({});
  const [parameterDrafts, setParameterDrafts] = useState<Record<string, ParameterDraft>>({});
  const [newParameters, setNewParameters] = useState<Record<string, ParameterDraft>>({});
  const [rangeDrafts, setRangeDrafts] = useState<Record<string, ReferenceRangeDraft>>({});
  const [newRanges, setNewRanges] = useState<Record<string, ReferenceRangeDraft>>({});
  const [expandedTests, setExpandedTests] = useState<Record<string, boolean>>({});
  const [savingTestId, setSavingTestId] = useState<string | null>(null);
  const [savingParameterId, setSavingParameterId] = useState<string | null>(null);
  const [deletingParameterId, setDeletingParameterId] = useState<string | null>(null);
  const [creatingParameterForTestId, setCreatingParameterForTestId] = useState<string | null>(null);
  const [savingRangeId, setSavingRangeId] = useState<string | null>(null);
  const [deletingRangeId, setDeletingRangeId] = useState<string | null>(null);
  const [creatingRangeForParameterId, setCreatingRangeForParameterId] = useState<string | null>(null);

  const catalogQuery = useQuery({
    queryKey: queryKeys.adminCatalog(),
    queryFn: async () => {
      const response = await api.get("/admin/catalog");
      return response.data as AdminCatalogResponse;
    },
  });

  const invalidateCatalog = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.adminCatalog() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.catalog() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.processing() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.validation() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dispatch() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.adminAudit() }),
    ]);
  };

  const updateTest = useMutation({
    mutationFn: async ({
      testId,
      payload,
    }: {
      testId: string;
      payload: { department: string; price: number; active: boolean };
    }) => {
      const response = await api.patch(`/admin/catalog/tests/${testId}`, payload);
      return response.data;
    },
    onSuccess: invalidateCatalog,
    onSettled: () => {
      setSavingTestId(null);
    },
  });

  const createParameter = useMutation({
    mutationFn: async ({ testId, payload }: { testId: string; payload: { name: string; unit: string; sortOrder: number } }) => {
      const response = await api.post(`/admin/catalog/tests/${testId}/parameters`, payload);
      return response.data;
    },
    onSuccess: invalidateCatalog,
    onSettled: () => {
      setCreatingParameterForTestId(null);
    },
  });

  const updateParameter = useMutation({
    mutationFn: async ({ parameterId, payload }: { parameterId: string; payload: { name: string; unit: string; sortOrder: number } }) => {
      const response = await api.patch(`/admin/catalog/parameters/${parameterId}`, payload);
      return response.data;
    },
    onSuccess: invalidateCatalog,
    onSettled: () => {
      setSavingParameterId(null);
    },
  });

  const deleteParameter = useMutation({
    mutationFn: async (parameterId: string) => {
      const response = await api.delete(`/admin/catalog/parameters/${parameterId}`);
      return response.data;
    },
    onSuccess: invalidateCatalog,
    onSettled: () => {
      setDeletingParameterId(null);
    },
  });

  const createRange = useMutation({
    mutationFn: async ({
      parameterId,
      payload,
    }: {
      parameterId: string;
      payload: {
        gender?: string;
        ageMinYears?: number;
        ageMaxYears?: number;
        normalLow?: number;
        normalHigh?: number;
        criticalLow?: number;
        criticalHigh?: number;
        unit: string;
      };
    }) => {
      const response = await api.post(`/admin/catalog/parameters/${parameterId}/reference-ranges`, payload);
      return response.data;
    },
    onSuccess: invalidateCatalog,
    onSettled: () => {
      setCreatingRangeForParameterId(null);
    },
  });

  const updateRange = useMutation({
    mutationFn: async ({
      rangeId,
      payload,
    }: {
      rangeId: string;
      payload: {
        gender?: string;
        ageMinYears?: number;
        ageMaxYears?: number;
        normalLow?: number;
        normalHigh?: number;
        criticalLow?: number;
        criticalHigh?: number;
        unit: string;
      };
    }) => {
      const response = await api.patch(`/admin/catalog/reference-ranges/${rangeId}`, payload);
      return response.data;
    },
    onSuccess: invalidateCatalog,
    onSettled: () => {
      setSavingRangeId(null);
    },
  });

  const deleteRange = useMutation({
    mutationFn: async (rangeId: string) => {
      const response = await api.delete(`/admin/catalog/reference-ranges/${rangeId}`);
      return response.data;
    },
    onSuccess: invalidateCatalog,
    onSettled: () => {
      setDeletingRangeId(null);
    },
  });

  if (catalogQuery.isLoading) {
    return <Skeleton className="h-72 w-full" />;
  }

  if (catalogQuery.isError || !catalogQuery.data) {
    return <EmptyState title="Catalog unavailable" message="The test catalog could not be loaded right now." />;
  }

  const isScientistRoute = user?.role === "LAB_SCIENTIST";

  return (
    <div className="space-y-4">
      <PageHero
        eyebrow={isScientistRoute ? "Scientist Setup" : "Catalog Control"}
        title="Analytes and reference ranges"
        description={
          isScientistRoute
            ? "Maintain the test definitions the bench depends on. Edit analytes, add patient-specific range bands, and keep the scientist workspace aligned with how this lab reports."
            : "Manage test setup, analytes, pricing, and report reference bands from one catalog workspace."
        }
        aside={
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-slate-100">
            Tests: {catalogQuery.data.summary.totalTests}
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-500">Total tests</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{catalogQuery.data.summary.totalTests}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Active tests</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{catalogQuery.data.summary.activeTests}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Panels</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{catalogQuery.data.summary.totalPanels}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Active panels</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{catalogQuery.data.summary.activePanels}</p>
        </Card>
      </div>

      <Card className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Category spread</h3>
          <p className="text-sm text-slate-500">How the current catalog is distributed across disciplines</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(catalogQuery.data.categories).map(([category, count]) => (
            <Badge key={category} className="bg-slate-100 text-slate-700">
              {category.replaceAll("_", " ")}: {count}
            </Badge>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Tests and bench setup</h3>
            <p className="text-sm text-slate-500">Adjust pricing, departments, analytes, and reference ranges without leaving the workflow.</p>
          </div>
          <div className="space-y-3">
            {catalogQuery.data.tests.map((test) => {
              const draft = drafts[test.id] ?? {
                department: test.department,
                price: String(test.price),
                active: String(test.active),
              };
              const isDirty =
                draft.department !== test.department ||
                Number(draft.price) !== test.price ||
                (draft.active === "true") !== test.active;
              const isExpanded = expandedTests[test.id] ?? false;
              const newParameterDraft = newParameters[test.id] ?? buildNewParameterDraft(test.parameters.length);

              return (
                <div key={test.id} className="rounded-xl border border-brand-border p-3">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {test.code} - {test.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {test.container} - {test.specimenTypes.join(", ")} - {test.parameterCount} parameters
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-blue-100 text-brand-blue">{test.category.replaceAll("_", " ")}</Badge>
                        <Badge className="bg-slate-100 text-slate-700">{test.referenceRangeCount} ranges</Badge>
                        <Badge className={test.active ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                          {test.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[1fr_160px_140px_auto]">
                      <label className="space-y-1 text-sm text-slate-600">
                        <span>Department</span>
                        <input
                          className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                          value={draft.department}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [test.id]: {
                                ...draft,
                                department: event.target.value,
                              },
                            }))
                          }
                        />
                      </label>

                      <label className="space-y-1 text-sm text-slate-600">
                        <span>Price</span>
                        <input
                          className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                          type="number"
                          min="0"
                          step="0.01"
                          value={draft.price}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [test.id]: {
                                ...draft,
                                price: event.target.value,
                              },
                            }))
                          }
                        />
                      </label>

                      <label className="space-y-1 text-sm text-slate-600">
                        <span>Status</span>
                        <select
                          className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                          value={draft.active}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [test.id]: {
                                ...draft,
                                active: event.target.value,
                              },
                            }))
                          }
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </label>

                      <div className="flex items-end gap-2">
                        <Button
                          disabled={!isDirty || !draft.department.trim() || draft.price === "" || (updateTest.isPending && savingTestId === test.id)}
                          onClick={() => {
                            setSavingTestId(test.id);
                            updateTest.mutate({
                              testId: test.id,
                              payload: {
                                department: draft.department.trim(),
                                price: Number(draft.price),
                                active: draft.active === "true",
                              },
                            });
                          }}
                        >
                          {updateTest.isPending && savingTestId === test.id ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          variant="secondary"
                          disabled={!isDirty}
                          onClick={() =>
                            setDrafts((current) => {
                              const next = { ...current };
                              delete next[test.id];
                              return next;
                            })
                          }
                        >
                          Reset
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-surface/60 px-3 py-3">
                      <p className="text-sm text-slate-500">Current price: {formatCurrency(test.price)}</p>
                      <Button variant="secondary" onClick={() => setExpandedTests((current) => ({ ...current, [test.id]: !isExpanded }))}>
                        {isExpanded ? "Hide analytes" : "Configure analytes"}
                      </Button>
                    </div>

                    {isExpanded ? (
                      <div className="space-y-4 rounded-xl border border-brand-border/70 bg-slate-50/70 p-4">
                        {test.parameters.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-brand-border bg-white px-4 py-6 text-sm text-slate-500">
                            No analytes configured for this test yet.
                          </div>
                        ) : null}

                        {test.parameters.map((parameter) => {
                          const parameterDraft = parameterDrafts[parameter.id] ?? buildParameterDraft(parameter);
                          const parameterDirty =
                            parameterDraft.name !== parameter.name ||
                            parameterDraft.unit !== parameter.unit ||
                            Number(parameterDraft.sortOrder) !== parameter.sortOrder;
                          const newRangeDraft = newRanges[parameter.id] ?? buildNewReferenceRangeDraft(parameter.unit);

                          return (
                            <div key={parameter.id} className="space-y-4 rounded-xl border border-brand-border bg-white p-4">
                              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <p className="font-semibold text-slate-900">{parameter.name}</p>
                                  <p className="text-sm text-slate-500">
                                    {parameter.referenceRanges.length} reference ranges configured
                                  </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Badge className="bg-slate-100 text-slate-700">{parameter.unit}</Badge>
                                  <Badge className="bg-slate-100 text-slate-700">Sort {parameter.sortOrder}</Badge>
                                </div>
                              </div>

                              <div className="grid gap-3 lg:grid-cols-[1.2fr_0.9fr_120px_auto]">
                                <label className="space-y-1 text-sm text-slate-600">
                                  <span>Analyte name</span>
                                  <input
                                    className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                                    value={parameterDraft.name}
                                    onChange={(event) =>
                                      setParameterDrafts((current) => ({
                                        ...current,
                                        [parameter.id]: {
                                          ...parameterDraft,
                                          name: event.target.value,
                                        },
                                      }))
                                    }
                                  />
                                </label>

                                <label className="space-y-1 text-sm text-slate-600">
                                  <span>Unit</span>
                                  <input
                                    className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                                    value={parameterDraft.unit}
                                    onChange={(event) =>
                                      setParameterDrafts((current) => ({
                                        ...current,
                                        [parameter.id]: {
                                          ...parameterDraft,
                                          unit: event.target.value,
                                        },
                                      }))
                                    }
                                  />
                                </label>

                                <label className="space-y-1 text-sm text-slate-600">
                                  <span>Sort</span>
                                  <input
                                    className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={parameterDraft.sortOrder}
                                    onChange={(event) =>
                                      setParameterDrafts((current) => ({
                                        ...current,
                                        [parameter.id]: {
                                          ...parameterDraft,
                                          sortOrder: event.target.value,
                                        },
                                      }))
                                    }
                                  />
                                </label>

                                <div className="flex items-end gap-2">
                                  <Button
                                    disabled={
                                      !parameterDirty ||
                                      !parameterDraft.name.trim() ||
                                      !parameterDraft.unit.trim() ||
                                      (updateParameter.isPending && savingParameterId === parameter.id)
                                    }
                                    onClick={() => {
                                      setSavingParameterId(parameter.id);
                                      updateParameter.mutate({
                                        parameterId: parameter.id,
                                        payload: {
                                          name: parameterDraft.name.trim(),
                                          unit: parameterDraft.unit.trim(),
                                          sortOrder: parseSortOrder(parameterDraft.sortOrder),
                                        },
                                      });
                                    }}
                                  >
                                    {updateParameter.isPending && savingParameterId === parameter.id ? "Saving..." : "Save"}
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    disabled={!parameterDirty}
                                    onClick={() =>
                                      setParameterDrafts((current) => {
                                        const next = { ...current };
                                        delete next[parameter.id];
                                        return next;
                                      })
                                    }
                                  >
                                    Reset
                                  </Button>
                                  <Button
                                    variant="danger"
                                    disabled={deleteParameter.isPending && deletingParameterId === parameter.id}
                                    onClick={() => {
                                      setDeletingParameterId(parameter.id);
                                      deleteParameter.mutate(parameter.id);
                                    }}
                                  >
                                    {deleteParameter.isPending && deletingParameterId === parameter.id ? "Deleting..." : "Delete"}
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-sm font-semibold text-slate-800">Reference ranges</p>
                                  <p className="text-xs text-slate-500">Set age, gender, normal, and critical bands</p>
                                </div>

                                {parameter.referenceRanges.length === 0 ? (
                                  <div className="rounded-xl border border-dashed border-brand-border bg-slate-50 px-4 py-4 text-sm text-slate-500">
                                    No reference ranges saved for this analyte yet.
                                  </div>
                                ) : null}

                                {parameter.referenceRanges.map((range) => {
                                  const rangeDraft = rangeDrafts[range.id] ?? buildReferenceRangeDraft(range);
                                  const rangeDirty =
                                    rangeDraft.gender !== (range.gender ?? "") ||
                                    rangeDraft.ageMinYears !== numberToDraft(range.ageMinYears) ||
                                    rangeDraft.ageMaxYears !== numberToDraft(range.ageMaxYears) ||
                                    rangeDraft.normalLow !== numberToDraft(range.normalLow) ||
                                    rangeDraft.normalHigh !== numberToDraft(range.normalHigh) ||
                                    rangeDraft.criticalLow !== numberToDraft(range.criticalLow) ||
                                    rangeDraft.criticalHigh !== numberToDraft(range.criticalHigh) ||
                                    rangeDraft.unit !== range.unit;

                                  return (
                                    <div key={range.id} className="rounded-xl border border-brand-border/80 bg-slate-50/80 p-4">
                                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <p className="text-sm font-semibold text-slate-800">{rangeSummary(range)}</p>
                                        <Badge className="bg-white text-slate-700">{range.unit}</Badge>
                                      </div>

                                      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                        <label className="space-y-1 text-sm text-slate-600">
                                          <span>Gender</span>
                                          <select
                                            className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                                            value={rangeDraft.gender}
                                            onChange={(event) =>
                                              setRangeDrafts((current) => ({
                                                ...current,
                                                [range.id]: {
                                                  ...rangeDraft,
                                                  gender: event.target.value,
                                                },
                                              }))
                                            }
                                          >
                                            <option value="">All</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                          </select>
                                        </label>

                                        <label className="space-y-1 text-sm text-slate-600">
                                          <span>Age min</span>
                                          <input
                                            className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={rangeDraft.ageMinYears}
                                            onChange={(event) =>
                                              setRangeDrafts((current) => ({
                                                ...current,
                                                [range.id]: {
                                                  ...rangeDraft,
                                                  ageMinYears: event.target.value,
                                                },
                                              }))
                                            }
                                          />
                                        </label>

                                        <label className="space-y-1 text-sm text-slate-600">
                                          <span>Age max</span>
                                          <input
                                            className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={rangeDraft.ageMaxYears}
                                            onChange={(event) =>
                                              setRangeDrafts((current) => ({
                                                ...current,
                                                [range.id]: {
                                                  ...rangeDraft,
                                                  ageMaxYears: event.target.value,
                                                },
                                              }))
                                            }
                                          />
                                        </label>

                                        <label className="space-y-1 text-sm text-slate-600">
                                          <span>Unit</span>
                                          <input
                                            className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                                            value={rangeDraft.unit}
                                            onChange={(event) =>
                                              setRangeDrafts((current) => ({
                                                ...current,
                                                [range.id]: {
                                                  ...rangeDraft,
                                                  unit: event.target.value,
                                                },
                                              }))
                                            }
                                          />
                                        </label>

                                        <label className="space-y-1 text-sm text-slate-600">
                                          <span>Normal low</span>
                                          <input
                                            className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                                            type="number"
                                            step="0.01"
                                            value={rangeDraft.normalLow}
                                            onChange={(event) =>
                                              setRangeDrafts((current) => ({
                                                ...current,
                                                [range.id]: {
                                                  ...rangeDraft,
                                                  normalLow: event.target.value,
                                                },
                                              }))
                                            }
                                          />
                                        </label>

                                        <label className="space-y-1 text-sm text-slate-600">
                                          <span>Normal high</span>
                                          <input
                                            className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                                            type="number"
                                            step="0.01"
                                            value={rangeDraft.normalHigh}
                                            onChange={(event) =>
                                              setRangeDrafts((current) => ({
                                                ...current,
                                                [range.id]: {
                                                  ...rangeDraft,
                                                  normalHigh: event.target.value,
                                                },
                                              }))
                                            }
                                          />
                                        </label>

                                        <label className="space-y-1 text-sm text-slate-600">
                                          <span>Critical low</span>
                                          <input
                                            className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                                            type="number"
                                            step="0.01"
                                            value={rangeDraft.criticalLow}
                                            onChange={(event) =>
                                              setRangeDrafts((current) => ({
                                                ...current,
                                                [range.id]: {
                                                  ...rangeDraft,
                                                  criticalLow: event.target.value,
                                                },
                                              }))
                                            }
                                          />
                                        </label>

                                        <label className="space-y-1 text-sm text-slate-600">
                                          <span>Critical high</span>
                                          <input
                                            className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                                            type="number"
                                            step="0.01"
                                            value={rangeDraft.criticalHigh}
                                            onChange={(event) =>
                                              setRangeDrafts((current) => ({
                                                ...current,
                                                [range.id]: {
                                                  ...rangeDraft,
                                                  criticalHigh: event.target.value,
                                                },
                                              }))
                                            }
                                          />
                                        </label>
                                      </div>

                                      <div className="mt-3 flex flex-wrap gap-2">
                                        <Button
                                          disabled={!rangeDirty || !rangeDraft.unit.trim() || (updateRange.isPending && savingRangeId === range.id)}
                                          onClick={() => {
                                            setSavingRangeId(range.id);
                                            updateRange.mutate({
                                              rangeId: range.id,
                                              payload: {
                                                gender: rangeDraft.gender || undefined,
                                                ageMinYears: parseOptionalInteger(rangeDraft.ageMinYears),
                                                ageMaxYears: parseOptionalInteger(rangeDraft.ageMaxYears),
                                                normalLow: parseOptionalNumber(rangeDraft.normalLow),
                                                normalHigh: parseOptionalNumber(rangeDraft.normalHigh),
                                                criticalLow: parseOptionalNumber(rangeDraft.criticalLow),
                                                criticalHigh: parseOptionalNumber(rangeDraft.criticalHigh),
                                                unit: rangeDraft.unit.trim(),
                                              },
                                            });
                                          }}
                                        >
                                          {updateRange.isPending && savingRangeId === range.id ? "Saving..." : "Save range"}
                                        </Button>
                                        <Button
                                          variant="secondary"
                                          disabled={!rangeDirty}
                                          onClick={() =>
                                            setRangeDrafts((current) => {
                                              const next = { ...current };
                                              delete next[range.id];
                                              return next;
                                            })
                                          }
                                        >
                                          Reset
                                        </Button>
                                        <Button
                                          variant="danger"
                                          disabled={deleteRange.isPending && deletingRangeId === range.id}
                                          onClick={() => {
                                            setDeletingRangeId(range.id);
                                            deleteRange.mutate(range.id);
                                          }}
                                        >
                                          {deleteRange.isPending && deletingRangeId === range.id ? "Deleting..." : "Delete range"}
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}

                                <div className="rounded-xl border border-dashed border-brand-border bg-white p-4">
                                  <p className="text-sm font-semibold text-slate-800">Add reference range</p>
                                  <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                    <label className="space-y-1 text-sm text-slate-600">
                                      <span>Gender</span>
                                      <select
                                        className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                                        value={newRangeDraft.gender}
                                        onChange={(event) =>
                                          setNewRanges((current) => ({
                                            ...current,
                                            [parameter.id]: {
                                              ...newRangeDraft,
                                              gender: event.target.value,
                                            },
                                          }))
                                        }
                                      >
                                        <option value="">All</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                      </select>
                                    </label>

                                    <label className="space-y-1 text-sm text-slate-600">
                                      <span>Age min</span>
                                      <input
                                        className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={newRangeDraft.ageMinYears}
                                        onChange={(event) =>
                                          setNewRanges((current) => ({
                                            ...current,
                                            [parameter.id]: {
                                              ...newRangeDraft,
                                              ageMinYears: event.target.value,
                                            },
                                          }))
                                        }
                                      />
                                    </label>

                                    <label className="space-y-1 text-sm text-slate-600">
                                      <span>Age max</span>
                                      <input
                                        className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={newRangeDraft.ageMaxYears}
                                        onChange={(event) =>
                                          setNewRanges((current) => ({
                                            ...current,
                                            [parameter.id]: {
                                              ...newRangeDraft,
                                              ageMaxYears: event.target.value,
                                            },
                                          }))
                                        }
                                      />
                                    </label>

                                    <label className="space-y-1 text-sm text-slate-600">
                                      <span>Unit</span>
                                      <input
                                        className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                                        value={newRangeDraft.unit}
                                        onChange={(event) =>
                                          setNewRanges((current) => ({
                                            ...current,
                                            [parameter.id]: {
                                              ...newRangeDraft,
                                              unit: event.target.value,
                                            },
                                          }))
                                        }
                                      />
                                    </label>

                                    <label className="space-y-1 text-sm text-slate-600">
                                      <span>Normal low</span>
                                      <input
                                        className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                                        type="number"
                                        step="0.01"
                                        value={newRangeDraft.normalLow}
                                        onChange={(event) =>
                                          setNewRanges((current) => ({
                                            ...current,
                                            [parameter.id]: {
                                              ...newRangeDraft,
                                              normalLow: event.target.value,
                                            },
                                          }))
                                        }
                                      />
                                    </label>

                                    <label className="space-y-1 text-sm text-slate-600">
                                      <span>Normal high</span>
                                      <input
                                        className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                                        type="number"
                                        step="0.01"
                                        value={newRangeDraft.normalHigh}
                                        onChange={(event) =>
                                          setNewRanges((current) => ({
                                            ...current,
                                            [parameter.id]: {
                                              ...newRangeDraft,
                                              normalHigh: event.target.value,
                                            },
                                          }))
                                        }
                                      />
                                    </label>

                                    <label className="space-y-1 text-sm text-slate-600">
                                      <span>Critical low</span>
                                      <input
                                        className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                                        type="number"
                                        step="0.01"
                                        value={newRangeDraft.criticalLow}
                                        onChange={(event) =>
                                          setNewRanges((current) => ({
                                            ...current,
                                            [parameter.id]: {
                                              ...newRangeDraft,
                                              criticalLow: event.target.value,
                                            },
                                          }))
                                        }
                                      />
                                    </label>

                                    <label className="space-y-1 text-sm text-slate-600">
                                      <span>Critical high</span>
                                      <input
                                        className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                                        type="number"
                                        step="0.01"
                                        value={newRangeDraft.criticalHigh}
                                        onChange={(event) =>
                                          setNewRanges((current) => ({
                                            ...current,
                                            [parameter.id]: {
                                              ...newRangeDraft,
                                              criticalHigh: event.target.value,
                                            },
                                          }))
                                        }
                                      />
                                    </label>
                                  </div>

                                  <div className="mt-3 flex flex-wrap gap-2">
                                    <Button
                                      disabled={!newRangeDraft.unit.trim() || (createRange.isPending && creatingRangeForParameterId === parameter.id)}
                                      onClick={() => {
                                        setCreatingRangeForParameterId(parameter.id);
                                        createRange.mutate({
                                          parameterId: parameter.id,
                                          payload: {
                                            gender: newRangeDraft.gender || undefined,
                                            ageMinYears: parseOptionalInteger(newRangeDraft.ageMinYears),
                                            ageMaxYears: parseOptionalInteger(newRangeDraft.ageMaxYears),
                                            normalLow: parseOptionalNumber(newRangeDraft.normalLow),
                                            normalHigh: parseOptionalNumber(newRangeDraft.normalHigh),
                                            criticalLow: parseOptionalNumber(newRangeDraft.criticalLow),
                                            criticalHigh: parseOptionalNumber(newRangeDraft.criticalHigh),
                                            unit: newRangeDraft.unit.trim(),
                                          },
                                        });
                                        setNewRanges((current) => ({
                                          ...current,
                                          [parameter.id]: buildNewReferenceRangeDraft(parameterDraft.unit || parameter.unit),
                                        }));
                                      }}
                                    >
                                      {createRange.isPending && creatingRangeForParameterId === parameter.id ? "Adding..." : "Add range"}
                                    </Button>
                                    <Button
                                      variant="secondary"
                                      onClick={() =>
                                        setNewRanges((current) => ({
                                          ...current,
                                          [parameter.id]: buildNewReferenceRangeDraft(parameterDraft.unit || parameter.unit),
                                        }))
                                      }
                                    >
                                      Clear
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        <div className="rounded-xl border border-dashed border-brand-border bg-white p-4">
                          <p className="text-sm font-semibold text-slate-800">Add analyte</p>
                          <div className="mt-3 grid gap-3 lg:grid-cols-[1.2fr_0.9fr_120px_auto]">
                            <label className="space-y-1 text-sm text-slate-600">
                              <span>Analyte name</span>
                              <input
                                className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                                value={newParameterDraft.name}
                                onChange={(event) =>
                                  setNewParameters((current) => ({
                                    ...current,
                                    [test.id]: {
                                      ...newParameterDraft,
                                      name: event.target.value,
                                    },
                                  }))
                                }
                              />
                            </label>

                            <label className="space-y-1 text-sm text-slate-600">
                              <span>Unit</span>
                              <input
                                className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                                value={newParameterDraft.unit}
                                onChange={(event) =>
                                  setNewParameters((current) => ({
                                    ...current,
                                    [test.id]: {
                                      ...newParameterDraft,
                                      unit: event.target.value,
                                    },
                                  }))
                                }
                              />
                            </label>

                            <label className="space-y-1 text-sm text-slate-600">
                              <span>Sort</span>
                              <input
                                className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                                type="number"
                                min="0"
                                step="1"
                                value={newParameterDraft.sortOrder}
                                onChange={(event) =>
                                  setNewParameters((current) => ({
                                    ...current,
                                    [test.id]: {
                                      ...newParameterDraft,
                                      sortOrder: event.target.value,
                                    },
                                  }))
                                }
                              />
                            </label>

                            <div className="flex items-end gap-2">
                              <Button
                                disabled={
                                  !newParameterDraft.name.trim() ||
                                  !newParameterDraft.unit.trim() ||
                                  (createParameter.isPending && creatingParameterForTestId === test.id)
                                }
                                onClick={() => {
                                  setCreatingParameterForTestId(test.id);
                                  createParameter.mutate({
                                    testId: test.id,
                                    payload: {
                                      name: newParameterDraft.name.trim(),
                                      unit: newParameterDraft.unit.trim(),
                                      sortOrder: parseSortOrder(newParameterDraft.sortOrder),
                                    },
                                  });
                                  setNewParameters((current) => ({
                                    ...current,
                                    [test.id]: buildNewParameterDraft(test.parameters.length + 1),
                                  }));
                                }}
                              >
                                {createParameter.isPending && creatingParameterForTestId === test.id ? "Adding..." : "Add analyte"}
                              </Button>
                              <Button
                                variant="secondary"
                                onClick={() =>
                                  setNewParameters((current) => ({
                                    ...current,
                                    [test.id]: buildNewParameterDraft(test.parameters.length + 1),
                                  }))
                                }
                              >
                                Clear
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Panels</h3>
            <p className="text-sm text-slate-500">Bundled profiles currently available in the system</p>
          </div>
          {catalogQuery.data.panels.length === 0 ? (
            <EmptyState title="No panels found" message="Saved test panels will appear here." />
          ) : (
            <div className="space-y-3">
              {catalogQuery.data.panels.map((panel) => (
                <div key={panel.id} className="rounded-xl border border-brand-border p-3">
                  <p className="font-semibold text-slate-900">
                    {panel.code} - {panel.name}
                  </p>
                  <p className="text-sm text-slate-500">{panel.description ?? "No description set"}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {panel.testCount} tests - {formatCurrency(panel.price)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {panel.tests.map((test) => (
                      <Badge key={test.id} className="bg-slate-100 text-slate-700">
                        {test.code}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
