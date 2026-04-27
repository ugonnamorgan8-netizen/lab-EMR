import { NavLink } from "react-router-dom";
import type { NavItem } from "../../types/app";
import { cn } from "../../utils/cn";
import { Card } from "../ui/Card";

export function Sidebar({ items, userLabel }: { items: NavItem[]; userLabel: string }) {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-brand-border bg-white md:flex md:flex-col">
      <div className="border-b border-brand-border p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">Lab EMR</p>
        <h1 className="mt-2 text-lg font-bold text-slate-900">Standalone Diagnostic Lab</h1>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-slate-600",
                isActive && "bg-blue-50 text-brand-blue",
              )
            }
          >
            <span>{item.label}</span>
            {item.badge ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{item.badge}</span> : null}
          </NavLink>
        ))}
      </nav>
      <div className="p-4">
        <Card className="bg-brand-surface">
          <p className="text-sm font-semibold text-slate-900">{userLabel}</p>
        </Card>
      </div>
    </aside>
  );
}
