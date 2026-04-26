import type { PropsWithChildren } from "react";
import { cn } from "../../utils/cn";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn("rounded-2xl border border-brand-border bg-white p-4", className)}>{children}</div>;
}
