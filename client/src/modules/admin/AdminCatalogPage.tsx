import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import type { AdminCatalogResponse } from "../../types/app";
import { formatCurrency } from "../../utils/formatCurrency";

type CatalogDraft = {
  department: string;
  price: string;
  active: string;
};

export function AdminCatalogPage() {
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, CatalogDraft>>({});
  const [savingTestId, setSavingTestId] = useState<string | null>(null);
  const catalogQuery = useQuery({
    queryKey: queryKeys.adminCatalog(),
    queryFn: async () => {
      const response = await api.get("/admin/catalog");
      return response.data as AdminCatalogResponse;
    },
  });

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminCatalog() });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminAudit() });
    },
    onSettled: () => {
      setSavingTestId(null);
    },
  });

  if (catalogQuery.isLoading) {
    return <Skeleton className="h-72 w-full" />;
  }

  if (catalogQuery.isError || !catalogQuery.data) {
    return <EmptyState title="Catalog unavailable" message="The test catalog could not be loaded right now." />;
  }

  return (
    <div className="space-y-4">
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
            <h3 className="text-lg font-semibold text-slate-900">Tests</h3>
            <p className="text-sm text-slate-500">Supervisors can adjust pricing, departments, and activation state.</p>
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

                    <p className="text-sm text-slate-500">Current price: {formatCurrency(test.price)}</p>
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
