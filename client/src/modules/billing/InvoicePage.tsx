import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import { formatCurrency } from "../../utils/formatCurrency";
import { PaymentReceiptModal } from "./PaymentReceiptModal";

export function InvoicePage() {
  const { visitId } = useParams();
  const queryClient = useQueryClient();
  const [showReceipt, setShowReceipt] = useState(false);
  const invoice = useQuery({
    queryKey: queryKeys.invoice(visitId ?? ""),
    queryFn: async () => {
      const response = await api.get(`/invoices/${visitId}`);
      return response.data;
    },
    enabled: Boolean(visitId),
  });

  const recordPayment = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/invoices/${visitId}/payment`, {
        amount: invoice.data.patientBalance,
        method: "CARD",
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoice(visitId ?? "") });
      setShowReceipt(true);
    },
  });

  if (!invoice.data) {
    return <EmptyState title="Invoice not found" message="Generate a visit invoice first." />;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1fr_0.4fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Invoice {invoice.data.invoiceId}</h3>
              <p className="text-sm text-slate-500">
                {invoice.data.patient.firstName} {invoice.data.patient.lastName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={invoice.data.status} />
              {invoice.data.payments && invoice.data.payments.length > 0 && (
                <Button variant="secondary" onClick={() => setShowReceipt(true)}>
                  🖨️ Receipt
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-3">
            {invoice.data.lineItems.map((item: { id: string; description: string; total: number }) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-brand-border p-3">
                <span className="text-sm text-slate-700">{item.description}</span>
                <span className="font-semibold text-slate-900">{formatCurrency(item.total)}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span>{formatCurrency(invoice.data.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Patient balance</span>
              <span className="font-semibold text-slate-900">{formatCurrency(invoice.data.patientBalance)}</span>
            </div>
          </div>
          <Button fullWidth disabled={invoice.data.patientBalance === 0 || recordPayment.isPending} onClick={() => recordPayment.mutate()}>
            {recordPayment.isPending ? "Confirming payment..." : "Confirm full payment"}
          </Button>
        </Card>
      </div>

      {showReceipt && (
        <PaymentReceiptModal
          isOpen={true}
          onClose={() => setShowReceipt(false)}
          invoice={invoice.data}
        />
      )}
    </div>
  );
}
