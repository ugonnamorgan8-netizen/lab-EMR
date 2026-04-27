import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, ...props },
  ref,
) {
  return (
    <label className="flex w-full flex-col gap-2 text-sm text-slate-700">
      {label ? <span className="font-medium">{label}</span> : null}
      <input
        ref={ref}
        className={cn(
          "min-h-11 rounded-lg border border-brand-border bg-white px-3 py-2 outline-none ring-0 placeholder:text-slate-400",
          error && "border-brand-red",
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-brand-red">{error}</span> : null}
    </label>
  );
});
