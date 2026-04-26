import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { CreateVisitInput, Urgency, VisitType } from "@shared/index";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import { formatCurrency } from "../../utils/formatCurrency";

export function NewVisitPage() {
  const [params] = useSearchParams();
  const patientId = params.get("patientId") ?? "";
  const navigate = useNavigate();
  const [selectedTests, setSelectedTests] = useState<Array<{ testCatalogId: string; urgency: Urgency }>>([]);
  const [type, setType] = useState<VisitType>("WALK_IN");
  const [urgency, setUrgency] = useState<Urgency>("ROUTINE");
  const [clinicalHistory, setClinicalHistory] = useState("");
  const [search, setSearch] = useState("");

  const patient = useQuery({
    queryKey: queryKeys.patient(patientId),
    queryFn: async () => {
      const response = await api.get(`/patients/${patientId}`);
      return response.data;
    },
    enabled: Boolean(patientId),
  });

  const catalog = useQuery({
    queryKey: queryKeys.catalog(),
    queryFn: async () => {
      const response = await api.get("/catalog");
      return response.data;
    },
  });

  const createVisit = useMutation({
    mutationFn: async (payload: CreateVisitInput) => {
      const response = await api.post("/visits", payload);
      return response.data;
    },
    onSuccess: (visit) => {
      navigate(`/billing/invoice/${visit.id}`);
    },
  });

  const filteredCatalog = useMemo(() => {
    const items = catalog.data ?? [];
    if (!search) {
      return items;
    }

    return items.filter(
      (item: { code: string; name: string }) =>
        item.code.toLowerCase().includes(search.toLowerCase()) || item.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [catalog.data, search]);

  const selectedIds = new Set(selectedTests.map((item) => item.testCatalogId));
  const selectedCatalog = (catalog.data ?? []).filter((item: { id: string }) => selectedIds.has(item.id));
  const subtotal = selectedCatalog.reduce((sum: number, item: { price: number }) => sum + item.price, 0);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
      <Card className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">New visit and test ordering</h3>
          <p className="text-sm text-slate-500">Select the visit type, urgency, and the tests to generate grouped samples and an invoice.</p>
        </div>
        {patient.data ? (
          <div className="rounded-xl border border-brand-border bg-brand-surface p-4 text-sm text-slate-700">
            {patient.data.firstName} {patient.data.lastName} • {patient.data.patientId}
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Visit type</span>
            <select className="min-h-11 rounded-lg border border-brand-border bg-white px-3 py-2" value={type} onChange={(event) => setType(event.target.value as VisitType)}>
              <option value="WALK_IN">Walk-in</option>
              <option value="REFERRAL">Referral</option>
              <option value="CORPORATE">Corporate</option>
              <option value="HOME_COLLECTION">Home Collection</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Urgency</span>
            <select className="min-h-11 rounded-lg border border-brand-border bg-white px-3 py-2" value={urgency} onChange={(event) => setUrgency(event.target.value as Urgency)}>
              <option value="ROUTINE">Routine</option>
              <option value="URGENT">Urgent</option>
              <option value="STAT">STAT</option>
            </select>
          </label>
          <Input label="Search tests" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="FBC, LFT, GLU..." />
        </div>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-700">Clinical history</span>
          <textarea className="min-h-24 rounded-lg border border-brand-border bg-white px-3 py-2" value={clinicalHistory} onChange={(event) => setClinicalHistory(event.target.value)} />
        </label>
        <div className="grid gap-3">
          {filteredCatalog.map((test: { id: string; code: string; name: string; department: string; price: number }) => {
            const selected = selectedIds.has(test.id);
            return (
              <button
                key={test.id}
                type="button"
                className={`rounded-xl border p-4 text-left ${selected ? "border-brand-blue bg-blue-50" : "border-brand-border bg-white"}`}
                onClick={() =>
                  setSelectedTests((current) =>
                    selected
                      ? current.filter((item) => item.testCatalogId !== test.id)
                      : [...current, { testCatalogId: test.id, urgency }],
                  )
                }
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {test.name} <span className="text-slate-400">({test.code})</span>
                    </p>
                    <p className="text-sm text-slate-500">{test.department}</p>
                  </div>
                  <div className="text-sm font-semibold text-brand-blue">{formatCurrency(test.price)}</div>
                </div>
              </button>
            );
          })}
          {filteredCatalog.length === 0 ? (
            <EmptyState title="No tests match this search" message="Try another code or clear the filter." />
          ) : null}
        </div>
      </Card>
      <Card className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Selected tests</h3>
          <p className="text-sm text-slate-500">This drawer becomes the mobile order review bar and drives invoice generation.</p>
        </div>
        <div className="space-y-3">
          {selectedCatalog.map((item: { id: string; name: string; price: number }) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-brand-border p-3">
              <span className="text-sm font-medium text-slate-700">{item.name}</span>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(item.price)}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-brand-surface p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
          </div>
        </div>
        <Button
          fullWidth
          disabled={!patientId || selectedTests.length === 0 || createVisit.isPending}
          onClick={() =>
            createVisit.mutate({
              patientId,
              type,
              urgency,
              clinicalHistory,
              tests: selectedTests,
            })
          }
        >
          {createVisit.isPending ? "Generating..." : "Confirm and generate invoice"}
        </Button>
      </Card>
    </div>
  );
}
