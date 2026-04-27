import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.96)_42%,rgba(10,37,64,0.92))] px-6 py-7 text-white shadow-[0_24px_64px_rgba(15,23,42,0.16)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">{eyebrow}</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{title}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">{description}</p>
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
    </div>
  );
}
