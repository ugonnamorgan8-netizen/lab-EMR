import { useQuery } from "@tanstack/react-query";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import type { AdminCatalogResponse } from "../../types/app";
import { formatCurrency } from "../../utils/formatCurrency";

export function AdminCatalogPage() {
  const catalogQuery = useQuery({
    queryKey: queryKeys.adminCatalog(),
    queryFn: async () => {
      const response = await api.get("/admin/catalog");
      return response.data as AdminCatalogResponse;
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

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Tests</h3>
            <p className="text-sm text-slate-500">Reference ranges and pricing-ready catalog entries</p>
          </div>
          <div className="space-y-3">
            {catalogQuery.data.tests.map((test) => (
              <div key={test.id} className="rounded-xl border border-brand-border p-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {test.code} · {test.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {test.department} · {test.container} · {test.specimenTypes.join(", ")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-100 text-brand-blue">{test.category.replaceAll("_", " ")}</Badge>
                    <Badge className="bg-slate-100 text-slate-700">{test.parameterCount} parameters</Badge>
                    <Badge className="bg-slate-100 text-slate-700">{test.referenceRangeCount} ranges</Badge>
                    <Badge className="bg-emerald-100 text-emerald-700">{formatCurrency(test.price)}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Panels</h3>
            <p className="text-sm text-slate-500">Bundled profiles available in the seeded catalog</p>
          </div>
          {catalogQuery.data.panels.length === 0 ? (
            <EmptyState title="No panels found" message="Saved test panels will appear here." />
          ) : (
            <div className="space-y-3">
              {catalogQuery.data.panels.map((panel) => (
                <div key={panel.id} className="rounded-xl border border-brand-border p-3">
                  <p className="font-semibold text-slate-900">
                    {panel.code} · {panel.name}
                  </p>
                  <p className="text-sm text-slate-500">{panel.description ?? "No description set"}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {panel.testCount} tests · {formatCurrency(panel.price)}
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
