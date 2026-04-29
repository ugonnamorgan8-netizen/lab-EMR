import type { PropsWithChildren } from "react";
import { cn } from "../../utils/cn";

export type CardVariant = "default" | "glass" | "gradient" | "accent" | "dark";

const VARIANT_STYLES: Record<CardVariant, string> = {
  default:  "rounded-[26px] border border-white/75 bg-white/92 p-5 shadow-panel backdrop-blur-sm",
  glass:    "rounded-[26px] border border-white/40 bg-white/60 p-5 shadow-lg backdrop-blur-md",
  gradient: "rounded-[26px] border border-blue-100/80 bg-gradient-to-br from-white via-sky-50/60 to-blue-50/80 p-5 shadow-panel",
  accent:   "rounded-[26px] border border-brand-border bg-gradient-to-br from-sky-50 to-indigo-50/50 p-5 shadow-panel",
  dark:     "rounded-[26px] border border-white/10 bg-[linear-gradient(135deg,#0a1f3d,#0d3060)] p-5 shadow-lg text-white",
};

export function Card({
  children,
  className,
  variant = "default",
}: PropsWithChildren<{ className?: string; variant?: CardVariant }>) {
  return (
    <div className={cn(VARIANT_STYLES[variant], className)}>
      {children}
    </div>
  );
}
