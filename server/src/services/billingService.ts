import { prisma } from "../lib/prisma.js";

export async function getInvoiceByVisitId(visitId: string) {
  return prisma.invoice.findUnique({
    where: { visitId },
    include: {
      patient: true,
      visit: true,
      lineItems: {
        include: {
          testOrder: {
            include: {
              testCatalog: true,
            },
          },
        },
      },
      payments: true,
    },
  });
}

export async function recordPayment(
  visitId: string,
  payload: { amount: number; method: "CASH" | "CARD" | "BANK_TRANSFER" | "HMO" | "POS"; reference?: string; recordedBy: string },
) {
  const invoice = await prisma.invoice.findUniqueOrThrow({
    where: { visitId },
    include: { payments: true },
  });

  const totalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0) + payload.amount;
  const patientBalance = Math.max(0, invoice.totalAmount - totalPaid);

  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      patientBalance,
      status: patientBalance === 0 ? "PAID" : "PARTIAL",
      paidAt: patientBalance === 0 ? new Date() : null,
      payments: {
        create: {
          amount: payload.amount,
          method: payload.method,
          reference: payload.reference,
          recordedBy: payload.recordedBy,
        },
      },
    },
    include: {
      patient: true,
      visit: true,
      lineItems: true,
      payments: true,
    },
  });

  return updatedInvoice;
}
