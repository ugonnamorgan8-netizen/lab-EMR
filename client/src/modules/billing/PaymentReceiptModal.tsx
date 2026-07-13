import { useRef } from "react";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { appBrand } from "../../utils/branding";

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  paymentDetails?: {
    amount: number;
    method: string;
    reference?: string;
    createdAt: string;
  };
}

export function PaymentReceiptModal({ isOpen, onClose, invoice, paymentDetails }: PaymentReceiptModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Use either specified payment details or the most recent payment on the invoice
  const activePayment = paymentDetails || (invoice.payments && invoice.payments.length > 0
    ? invoice.payments[invoice.payments.length - 1]
    : null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:max-h-full print:rounded-none print:w-full print:h-full">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 print:hidden">
          <h3 className="text-lg font-bold text-slate-800">Payment Receipt</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Printable Area */}
        <div ref={printAreaRef} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 print:overflow-visible print:p-0">
          {/* Receipt Wrapper (Has standard invoice style look for print layout) */}
          <div className="space-y-6 text-slate-800 print:text-black">
            
            {/* Header Branding */}
            <div className="text-center pb-4 border-b border-dashed border-slate-200">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 print:text-black uppercase">
                {appBrand.labName}
              </h2>
              <p className="text-xs text-slate-500 mt-1">{appBrand.address}</p>
              <p className="text-xs text-slate-500">Tel: {appBrand.phone} | Email: {appBrand.email}</p>
              <div className="mt-3 inline-block bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider print:bg-white print:border print:border-black">
                Official Receipt
              </div>
            </div>

            {/* Meta Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 font-medium">PATIENT DETAILS</p>
                <p className="font-bold text-slate-800 mt-0.5 uppercase">
                  {invoice.patient?.firstName} {invoice.patient?.lastName}
                </p>
                <p className="text-slate-500 mt-0.5">{invoice.patient?.patientId}</p>
                <p className="text-slate-500">{invoice.patient?.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-medium text-right">RECEIPT DETAILS</p>
                <p className="font-bold text-slate-800 mt-0.5">
                  Receipt #: REC-{activePayment?.id?.slice(-6).toUpperCase() || "NEW"}
                </p>
                <p className="text-slate-500 mt-0.5">Invoice: {invoice.invoiceId}</p>
                <p className="text-slate-500">Date: {formatDate(activePayment?.createdAt || new Date())}</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border-t border-b border-slate-100 py-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Services Billed</p>
              <div className="space-y-1.5">
                {invoice.lineItems?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-slate-600">{item.description}</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Bill:</span>
                <span className="font-semibold">{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-bold border-t border-dashed border-slate-100 pt-2 text-sm">
                <span>Amount Paid:</span>
                <span>{formatCurrency(activePayment?.amount || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Payment Method:</span>
                <span className="font-bold">{activePayment?.method || "CARD"}</span>
              </div>
              {activePayment?.reference && (
                <div className="flex justify-between text-slate-500">
                  <span>Reference:</span>
                  <span>{activePayment.reference}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-100 pt-2 text-slate-600 font-medium">
                <span>Remaining Balance:</span>
                <span className="font-bold text-slate-900">{formatCurrency(invoice.patientBalance)}</span>
              </div>
            </div>

            {/* Footer note */}
            <div className="text-center text-[10px] text-slate-400 pt-6 border-t border-slate-100">
              <p>Thank you for choosing {appBrand.labName}.</p>
              <p className="mt-0.5">This is a system-generated electronic receipt.</p>
            </div>

          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100 justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-md transition-all flex items-center gap-1.5"
          >
            <span>🖨️</span> Print Receipt
          </button>
        </div>

      </div>
    </div>
  );
}
