import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MetricCard } from "../../components/shared/MetricCard";
import { PageHero } from "../../components/shared/PageHero";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import type { OutstandingInvoice } from "../../types/app";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

export function OutstandingInvoicesPage() {
  const queryClient = useQueryClient();
  const invoices = useQuery({
    queryKey: queryKeys.billingOutstanding(),
    queryFn: async () => {
      const response = await api.get("/workflows/billing/outstanding");
      return response.data as OutstandingInvoice[];
    },
  });

  const settleInvoice = useMutation({
    mutationFn: async ({ visitId, amount }: { visitId: string; amount: number }) => {
      const response = await api.post(`/invoices/${visitId}/payment`, {
        amount,
        method: "CARD",
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.billingOutstanding() });
      queryClient.invalidateQueries({ queryKey: queryKeys.billingDashboard() });
    },
  });

  if (invoices.isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (invoices.isError || !invoices.data) {
    return <EmptyState title="Outstanding invoices unavailable" message="The receivables queue could not be loaded." />;
  }

  const outstandingBalance = invoices.data.reduce((sum, invoice) => sum + invoice.patientBalance, 0);

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Receivables"
        title="Outstanding invoices"
        description="Stay ahead of unpaid and partially paid invoices with a focused receivables board and one-click full settlement for demo workflows."
        aside={<div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-100">Open balances: {invoices.data.length}</div>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Outstanding invoices" value={invoices.data.length} hint="Accounts still carrying a patient balance" />
        <MetricCard label="Outstanding value" value={formatCurrency(outstandingBalance)} hint="Combined receivables still open" />
        <MetricCard label="Average balance" value={formatCurrency(invoices.data.length ? outstandingBalance / invoices.data.length : 0)} hint="Average amount per outstanding invoice" />
      </div>

      {invoices.data.length === 0 ? (
        <EmptyState title="No outstanding invoices" message="All current invoices are settled." />
      ) : (
        <div className="grid gap-4">
          {invoices.data.map((invoice) => (
            <Card key={invoice.id} className="space-y-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{invoice.invoiceId}</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">{invoice.patientName}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {invoice.visitRef} · {invoice.patientPhone} · raised {formatDate(invoice.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(invoice.totalAmount)}</p>
                    <p className="text-xs text-slate-500">Balance {formatCurrency(invoice.patientBalance)}</p>
                  </div>
                  <StatusBadge status={invoice.status} />
                  <Button
                    disabled={settleInvoice.isPending}
                    onClick={() => settleInvoice.mutate({ visitId: invoice.visitId, amount: invoice.patientBalance })}
                  >
                    Record full payment
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
