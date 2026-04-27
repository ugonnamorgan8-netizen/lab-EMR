import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, className, ...props },
  ref,
) {
  return (
    <label className="flex w-full flex-col gap-2 text-sm text-slate-700">
      {label ? <span className="font-medium">{label}</span> : null}
      <textarea
        ref={ref}
        className={cn("min-h-24 rounded-lg border border-brand-border bg-white px-3 py-2", className)}
        {...props}
      />
    </label>
  );
});
