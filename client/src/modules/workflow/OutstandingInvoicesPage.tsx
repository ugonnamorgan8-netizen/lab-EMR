import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
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
import { PaymentReceiptModal } from "../billing/PaymentReceiptModal";

export function OutstandingInvoicesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [receiptDetails, setReceiptDetails] = useState<any>(null);
  
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.billingOutstanding() });
      queryClient.invalidateQueries({ queryKey: queryKeys.billingDashboard() });
      
      // Load full invoice details to show in the receipt modal
      setSelectedInvoice(data);
      if (data.payments && data.payments.length > 0) {
        setReceiptDetails(data.payments[data.payments.length - 1]);
      }
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
        eyebrow="Accounts Desk"
        title="Payment queue"
        description="See registered patients waiting for payment confirmation, quote their total, receive funds, and close invoices cleanly at the accounts desk."
        aside={<div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-100">Open balances: {invoices.data.length}</div>}
      />

      {/* ── Summary metric cards ──────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Patients awaiting payment"
          value={invoices.data.length}
          hint="Invoices still waiting for full accounts confirmation"
          icon="🧑‍💼"
          variant="blue"
        />
        <MetricCard
          label="Outstanding value"
          value={formatCurrency(outstandingBalance)}
          hint="Combined receivables still open"
          icon="💰"
          variant="rose"
        />
        <MetricCard
          label="Average bill"
          value={invoices.data.length ? outstandingBalance / invoices.data.length : 0}
          hint="Average amount currently presented at the desk"
          icon="💳"
          variant="amber"
        />
      </div>

      {/* ── Invoice cards ─────────────────────────────────────────────── */}
      {invoices.data.length === 0 ? (
        <EmptyState title="No outstanding invoices" message="All current invoices are settled." />
      ) : (
        <div className="grid gap-4">
          {invoices.data.map((invoice) => (
            <Card key={invoice.id} variant="gradient" className="space-y-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                {/* Patient info */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 text-2xl text-white shadow-md">
                    👤
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{invoice.invoiceId}</p>
                    <h3 className="mt-1 text-xl font-semibold text-slate-900">{invoice.patientName}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {invoice.visitRef} · {invoice.patientPhone} · raised {formatDate(invoice.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Amount + actions */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Amount pill */}
                  <div className="flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100/60 border border-emerald-200/60 px-4 py-2">
                    <span className="text-lg">💰</span>
                    <div>
                      <p className="text-sm font-bold text-emerald-900">{formatCurrency(invoice.totalAmount)}</p>
                      <p className="text-xs text-slate-500">Balance {formatCurrency(invoice.patientBalance)}</p>
                    </div>
                  </div>
                  <StatusBadge status={invoice.status} />
                  <Button variant="secondary" onClick={() => navigate(`/billing/invoice/${invoice.visitId}`)}>
                    🧾 Open invoice
                  </Button>
                  <Button
                    disabled={settleInvoice.isPending}
                    onClick={() => settleInvoice.mutate({ visitId: invoice.visitId, amount: invoice.patientBalance })}
                  >
                    ✅ Confirm full payment
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Payment Receipt Modal ─────────────────────────────────────── */}
      {selectedInvoice && (
        <PaymentReceiptModal
          isOpen={true}
          onClose={() => {
            setSelectedInvoice(null);
            setReceiptDetails(null);
          }}
          invoice={selectedInvoice}
          paymentDetails={receiptDetails}
        />
      )}
    </div>
  );
}
