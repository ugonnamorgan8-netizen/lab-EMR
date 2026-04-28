import { NavLink } from "react-router-dom";
import type { NavItem } from "../../types/app";
import { appBrand } from "../../utils/branding";
import { cn } from "../../utils/cn";
import { Card } from "../ui/Card";

export function Sidebar({ items, userLabel }: { items: NavItem[]; userLabel: string }) {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/40 bg-[linear-gradient(180deg,rgba(15,47,88,0.98),rgba(15,94,168,0.96)_56%,rgba(30,121,197,0.94))] text-white md:flex md:flex-col">
      <div className="border-b border-white/15 px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/96 shadow-[0_14px_32px_rgba(15,47,88,0.22)]">
            <img src={appBrand.logoPath} alt={appBrand.labName} className="h-12 w-12 object-contain" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-100/90">{appBrand.shortName}</p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-white">{appBrand.labName}</h1>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-sky-100">{appBrand.shellTagline}</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-sky-100 transition hover:bg-white/16 hover:text-white",
                isActive && "bg-white text-brand-blue shadow-[0_14px_30px_rgba(7,24,48,0.18)]",
              )
            }
          >
            <span>{item.label}</span>
            {item.badge ? <span className="rounded-full bg-brand-surface px-2 py-0.5 text-xs text-brand-blue">{item.badge}</span> : null}
          </NavLink>
        ))}
      </nav>
      <div className="p-4">
        <Card className="border-white/20 bg-white/14">
          <p className="text-sm font-semibold text-white">{userLabel}</p>
        </Card>
      </div>
    </aside>
  );
}
