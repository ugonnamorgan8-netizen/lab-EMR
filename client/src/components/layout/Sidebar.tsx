import { NavLink } from "react-router-dom";
import type { NavItem } from "../../types/app";
import { cn } from "../../utils/cn";
import { Card } from "../ui/Card";

export function Sidebar({ items, userLabel }: { items: NavItem[]; userLabel: string }) {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.9))] md:flex md:flex-col">
      <div className="border-b border-white/60 px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-blue">Lab EMR</p>
        <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">Standalone Diagnostic Lab</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Premium laboratory operations, quality oversight, and revenue control in one workspace.</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-white/80 hover:text-slate-900",
                isActive && "bg-white text-brand-blue shadow-[0_10px_28px_rgba(15,23,42,0.08)]",
              )
            }
          >
            <span>{item.label}</span>
            {item.badge ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{item.badge}</span> : null}
          </NavLink>
        ))}
      </nav>
      <div className="p-4">
        <Card className="bg-[linear-gradient(135deg,#f8fafc,#eef3f8)]">
          <p className="text-sm font-semibold text-slate-900">{userLabel}</p>
        </Card>
      </div>
    </aside>
  );
}
