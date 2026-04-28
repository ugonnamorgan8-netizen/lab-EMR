import type { ReactNode } from "react";
import { Card } from "../ui/Card";

export function MetricCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: ReactNode;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-sky-100 blur-2xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          {accent}
        </div>
        <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
        {hint ? <p className="mt-2 text-xs leading-5 text-slate-500">{hint}</p> : null}
      </div>
    </Card>
  );
}
