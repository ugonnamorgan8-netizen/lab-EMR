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
        "inline-flex min-h-11 items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "border-brand-blue bg-[linear-gradient(135deg,#0F5EA8,#0F2F58)] text-white shadow-[0_16px_28px_rgba(15,94,168,0.24)] hover:brightness-110",
        variant === "secondary" && "border-brand-border bg-white/90 text-slate-700 hover:border-brand-blue/40 hover:bg-white",
        variant === "danger" && "border-brand-red bg-brand-red text-white hover:brightness-110",
        variant === "ghost" && "border-transparent bg-transparent text-brand-blue hover:bg-brand-surface/70 hover:text-brand-navy",
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
