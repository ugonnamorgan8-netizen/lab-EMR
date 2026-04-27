import type { PropsWithChildren } from "react";
import { cn } from "../../utils/cn";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "rounded-[26px] border border-white/70 bg-white/90 p-5 shadow-panel backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
