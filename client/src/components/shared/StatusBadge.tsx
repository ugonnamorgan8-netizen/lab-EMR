import { Badge } from "../ui/Badge";

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "DISPATCHED" || status === "PAID" || status === "VALIDATED" || status === "COLLECTED"
      ? "bg-green-100 text-brand-green"
      : status === "STAT" || status === "UNPAID" || status === "CANCELLED"
        ? "bg-red-100 text-brand-red"
        : status === "URGENT" || status === "PARTIAL"
          ? "bg-amber-100 text-brand-amber"
          : status === "REGISTERED" || status === "IN_ANALYSIS" || status === "IN_PROCESSING"
            ? "bg-blue-100 text-brand-blue"
            : "bg-slate-100 text-brand-gray";

  return <Badge className={tone}>{status.replaceAll("_", " ")}</Badge>;
}
