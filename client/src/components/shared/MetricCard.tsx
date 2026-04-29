import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export type MetricVariant =
  | "blue"
  | "green"
  | "amber"
  | "rose"
  | "violet"
  | "teal"
  | "orange"
  | "indigo"
  | "sky"
  | "emerald"
  | "purple"
  | "slate";

const VARIANT_STYLES: Record<
  MetricVariant,
  { card: string; iconBg: string; value: string; glow: string; label: string }
> = {
  blue:    { card: "from-blue-50 via-sky-50/80 to-blue-100/50 border-blue-200/70",        iconBg: "bg-gradient-to-br from-blue-500 to-blue-700",     value: "text-blue-900",    glow: "bg-blue-400/25",    label: "text-blue-600/80" },
  sky:     { card: "from-sky-50 via-cyan-50/80 to-sky-100/50 border-sky-200/70",           iconBg: "bg-gradient-to-br from-sky-500 to-sky-700",       value: "text-sky-900",     glow: "bg-sky-400/25",     label: "text-sky-600/80" },
  green:   { card: "from-green-50 via-emerald-50/80 to-green-100/50 border-green-200/70",  iconBg: "bg-gradient-to-br from-green-500 to-emerald-700", value: "text-green-900",   glow: "bg-green-400/25",   label: "text-green-600/80" },
  emerald: { card: "from-emerald-50 via-teal-50/80 to-emerald-100/50 border-emerald-200/70", iconBg: "bg-gradient-to-br from-emerald-500 to-teal-700", value: "text-emerald-900", glow: "bg-emerald-400/25", label: "text-emerald-600/80" },
  amber:   { card: "from-amber-50 via-yellow-50/80 to-amber-100/50 border-amber-200/70",   iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",  value: "text-amber-900",   glow: "bg-amber-400/25",   label: "text-amber-700/80" },
  rose:    { card: "from-rose-50 via-pink-50/80 to-rose-100/50 border-rose-200/70",        iconBg: "bg-gradient-to-br from-rose-500 to-pink-700",     value: "text-rose-900",    glow: "bg-rose-400/25",    label: "text-rose-600/80" },
  violet:  { card: "from-violet-50 via-purple-50/80 to-violet-100/50 border-violet-200/70", iconBg: "bg-gradient-to-br from-violet-500 to-purple-700", value: "text-violet-900",  glow: "bg-violet-400/25",  label: "text-violet-600/80" },
  purple:  { card: "from-purple-50 via-violet-50/80 to-purple-100/50 border-purple-200/70", iconBg: "bg-gradient-to-br from-purple-500 to-violet-700", value: "text-purple-900",  glow: "bg-purple-400/25",  label: "text-purple-600/80" },
  teal:    { card: "from-teal-50 via-cyan-50/80 to-teal-100/50 border-teal-200/70",        iconBg: "bg-gradient-to-br from-teal-500 to-cyan-700",     value: "text-teal-900",    glow: "bg-teal-400/25",    label: "text-teal-600/80" },
  orange:  { card: "from-orange-50 via-red-50/80 to-orange-100/50 border-orange-200/70",   iconBg: "bg-gradient-to-br from-orange-500 to-red-600",    value: "text-orange-900",  glow: "bg-orange-400/25",  label: "text-orange-700/80" },
  indigo:  { card: "from-indigo-50 via-blue-50/80 to-indigo-100/50 border-indigo-200/70",  iconBg: "bg-gradient-to-br from-indigo-500 to-blue-700",   value: "text-indigo-900",  glow: "bg-indigo-400/25",  label: "text-indigo-600/80" },
  slate:   { card: "from-slate-50 via-gray-50/80 to-slate-100/50 border-slate-200/70",     iconBg: "bg-gradient-to-br from-slate-500 to-slate-700",   value: "text-slate-900",   glow: "bg-slate-400/25",   label: "text-slate-500/80" },
};

export function MetricCard({
  label,
  value,
  hint,
  icon,
  variant = "blue",
  accent,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: string;
  variant?: MetricVariant;
  /** @deprecated use icon + variant instead */
  accent?: ReactNode;
}) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        styles.card,
      )}
    >
      {/* Decorative glow orb */}
      <div
        className={cn(
          "pointer-events-none absolute -right-5 -top-5 h-28 w-28 rounded-full blur-2xl opacity-70",
          styles.glow,
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        {/* Text block */}
        <div className="min-w-0 flex-1">
          <p className={cn("text-[10px] font-bold uppercase tracking-[0.22em]", styles.label)}>
            {label}
          </p>
          <p className={cn("mt-3 text-[1.75rem] font-bold leading-none tracking-tight", styles.value)}>
            {value}
          </p>
          {hint ? (
            <p className="mt-2 text-xs leading-5 text-slate-500">{hint}</p>
          ) : null}
        </div>

        {/* Icon box */}
        {icon ? (
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl text-white shadow-lg",
              "transition-transform duration-200 group-hover:scale-110",
              styles.iconBg,
            )}
          >
            {icon}
          </div>
        ) : accent ? (
          <div>{accent}</div>
        ) : null}
      </div>
    </div>
  );
}
