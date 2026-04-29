import { NavLink } from "react-router-dom";
import type { NavItem } from "../../types/app";
import { appBrand } from "../../utils/branding";
import { cn } from "../../utils/cn";
import { BrandLogo } from "../brand/BrandLogo";

export function Sidebar({ items }: { items: NavItem[] }) {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/40 bg-[linear-gradient(180deg,rgba(15,47,88,0.98),rgba(15,94,168,0.96)_56%,rgba(30,121,197,0.94))] text-white md:flex md:flex-col">
      <div className="border-b border-white/15 px-6 py-6">
        <div className="flex flex-col items-center text-center">
          <BrandLogo src={appBrand.logoPath} alt={appBrand.labName} size="lg" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.32em] text-sky-100/90">{appBrand.shortName}</p>
          <h1 className="mt-3 text-xl font-semibold tracking-tight text-white">{appBrand.labName}</h1>
          <p className="mt-3 text-sm leading-6 text-sky-100">{appBrand.shellTagline}</p>
          <div className="mt-4 space-y-1 text-xs leading-5 text-sky-100/95">
            <p>{appBrand.address}</p>
            <p>{appBrand.email}</p>
            <p>{appBrand.phone}</p>
            <p>{appBrand.website}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                // ── Shared base ─────────────────────────────────────────────
                "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition duration-150",
                isActive
                  ? // ── Selected (persistent inversion) ─────────────────────
                    // Use Tailwind's ! (important) modifier so the active
                    // bg/text can NEVER be overridden by any hover rule.
                    // This is the fix: !bg-white and !text-slate-900 beat
                    // every other class regardless of CSS order.
                    "border-white/20 !bg-white !text-slate-900 shadow-[0_16px_34px_rgba(7,24,48,0.2)]"
                  : // ── Inactive (hover inversion only) ──────────────────────
                    // No bg/text set at rest — only on :hover.
                    // Disappears naturally when cursor leaves (pure CSS :hover).
                    "border-transparent bg-white/10 text-white hover:border-white/20 hover:bg-white hover:text-slate-900",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span>{item.label}</span>
                {item.badge ? (
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-xs transition duration-150",
                      isActive
                        ? "border-brand-blue/30 bg-brand-blue/10 text-brand-blue"
                        : "border-white/20 bg-white/10 text-white",
                    )}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
