import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function Textarea({ label, className, ...props }: TextareaProps) {
  return (
    <label className="flex w-full flex-col gap-2 text-sm text-slate-700">
      {label ? <span className="font-medium">{label}</span> : null}
      <textarea
        className={cn("min-h-24 rounded-lg border border-brand-border bg-white px-3 py-2", className)}
        {...props}
      />
    </label>
  );
}
