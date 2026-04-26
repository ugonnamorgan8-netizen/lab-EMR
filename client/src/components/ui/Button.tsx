import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../../utils/cn";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    fullWidth?: boolean;
  }
>;

export function Button({ children, className, variant = "primary", fullWidth, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold transition",
        variant === "primary" && "border-brand-blue bg-brand-blue text-white",
        variant === "secondary" && "border-brand-border bg-white text-slate-700",
        variant === "danger" && "border-brand-red bg-brand-red text-white",
        variant === "ghost" && "border-transparent bg-transparent text-slate-600",
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
