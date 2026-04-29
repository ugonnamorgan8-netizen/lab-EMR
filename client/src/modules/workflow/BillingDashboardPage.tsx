import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "../../components/shared/MetricCard";
import { PageHero } from "../../components/shared/PageHero";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import type { BillingDashboardResponse } from "../../types/app";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

export function BillingDashboardPage() {
  const billing = useQuery({
    queryKey: queryKeys.billingDashboard(),
    queryFn: async () => {
      const response = await api.get("/workflows/billing/dashboard");
      return response.data as BillingDashboardResponse;
    },
  });

  if (billing.isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (billing.isError || !billing.data) {
    return <EmptyState title="Billing dashboard unavailable" message="Financial analytics could not be loaded right now." />;
  }

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Revenue Cycle"
        title="Billing dashboard"
        description="Track collections, outstanding balances, and invoice throughput across the lab with finance-friendly visibility into every open account."
        aside={<div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-100">Invoices: {billing.data.summary.totalInvoices}</div>}
      />

      {/* ── Key financial metrics ─────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Gross revenue"
          value={formatCurrency(billing.data.summary.grossRevenue)}
          hint="Total invoiced value in the system"
          icon="💼"
          variant="blue"
        />
        <MetricCard
          label="Collected revenue"
          value={formatCurrency(billing.data.summary.collectedRevenue)}
          hint="Payments recorded to date"
          icon="💰"
          variant="emerald"
        />
        <MetricCard
          label="Outstanding balance"
          value={formatCurrency(billing.data.summary.outstandingBalance)}
          hint="Remaining patient receivables"
          icon="💳"
          variant="rose"
        />
        <MetricCard
          label="Unpaid invoices"
          value={billing.data.summary.unpaidCount}
          hint="Invoices with no payment recorded yet"
          icon="🧾"
          variant="amber"
        />
        <MetricCard
          label="Partial invoices"
          value={billing.data.summary.partialCount}
          hint="Invoices still carrying a balance"
          icon="⚖️"
          variant="orange"
        />
        <MetricCard
          label="Invoice volume"
          value={billing.data.summary.totalInvoices}
          hint="Total billing records issued"
          icon="🗂️"
          variant="violet"
        />
      </div>

      {/* ── Recent invoices ───────────────────────────────────────────── */}
      {billing.data.invoices.length === 0 ? (
        <EmptyState title="No invoice history" message="Invoices will appear here once visits are billed." />
      ) : (
        <Card variant="gradient" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-xl text-white shadow">
              🧾
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Recent invoices</h3>
              <p className="text-sm text-slate-500">Latest billing activity across the lab</p>
            </div>
          </div>
          <div className="space-y-3">
            {billing.data.invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-col gap-3 rounded-2xl border border-brand-border bg-white/70 p-4 shadow-sm transition-all duration-200 hover:shadow-md lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-xl">
                    💳
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{invoice.invoiceId}</p>
                    <p className="text-sm text-slate-500">
                      {invoice.patientName} · {invoice.visitRef} · {formatDate(invoice.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(invoice.totalAmount)}</p>
                    <p className="text-xs text-slate-500">Balance {formatCurrency(invoice.patientBalance)}</p>
                  </div>
                  <StatusBadge status={invoice.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
