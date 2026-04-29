import { NavLink } from "react-router-dom";
import type { NavItem } from "../../types/app";
import { appBrand } from "../../utils/branding";
import { cn } from "../../utils/cn";
import { BrandLogo } from "../brand/BrandLogo";

// ── Color palette map ────────────────────────────────────────────────────────
// Each colorKey maps to: [inactive pill bg, inactive text, active pill bg, active text, glow]
const COLOR_MAP: Record<
  string,
  { inactive: string; active: string; dot: string }
> = {
  sky:     { inactive: "bg-sky-400/20 text-sky-100 border-sky-400/30",     active: "bg-sky-400 text-sky-950 border-sky-300",     dot: "bg-sky-400" },
  teal:    { inactive: "bg-teal-400/20 text-teal-100 border-teal-400/30",   active: "bg-teal-400 text-teal-950 border-teal-300",   dot: "bg-teal-400" },
  violet:  { inactive: "bg-violet-400/20 text-violet-100 border-violet-400/30", active: "bg-violet-400 text-violet-950 border-violet-300", dot: "bg-violet-400" },
  amber:   { inactive: "bg-amber-400/20 text-amber-100 border-amber-400/30", active: "bg-amber-400 text-amber-950 border-amber-300", dot: "bg-amber-400" },
  emerald: { inactive: "bg-emerald-400/20 text-emerald-100 border-emerald-400/30", active: "bg-emerald-400 text-emerald-950 border-emerald-300", dot: "bg-emerald-400" },
  green:   { inactive: "bg-green-400/20 text-green-100 border-green-400/30",  active: "bg-green-400 text-green-950 border-green-300",  dot: "bg-green-400" },
  rose:    { inactive: "bg-rose-400/20 text-rose-100 border-rose-400/30",    active: "bg-rose-400 text-rose-950 border-rose-300",    dot: "bg-rose-400" },
  orange:  { inactive: "bg-orange-400/20 text-orange-100 border-orange-400/30", active: "bg-orange-400 text-orange-950 border-orange-300", dot: "bg-orange-400" },
  indigo:  { inactive: "bg-indigo-400/20 text-indigo-100 border-indigo-400/30", active: "bg-indigo-400 text-indigo-950 border-indigo-300", dot: "bg-indigo-400" },
  slate:   { inactive: "bg-slate-300/20 text-slate-100 border-slate-300/30",  active: "bg-slate-200 text-slate-900 border-slate-300",  dot: "bg-slate-300" },
  purple:  { inactive: "bg-purple-400/20 text-purple-100 border-purple-400/30", active: "bg-purple-400 text-purple-950 border-purple-300", dot: "bg-purple-400" },
};

const DEFAULT_COLOR = COLOR_MAP.sky;

export function Sidebar({ items }: { items: NavItem[] }) {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[linear-gradient(180deg,#0a1f3d_0%,#0d3060_40%,#0f3d7a_70%,#1155a0_100%)] text-white md:flex md:flex-col shadow-2xl">

      {/* ── Brand header ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/10 px-6 py-5">
        {/* subtle radial glow behind logo */}
        <div className="pointer-events-none absolute -top-8 left-1/2 h-32 w-48 -translate-x-1/2 rounded-full bg-sky-500/20 blur-2xl" />
        <div className="relative flex flex-col items-center text-center">
          <BrandLogo src={appBrand.logoPath} alt={appBrand.labName} size="lg" />
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.35em] text-sky-300/80">
            {appBrand.shortName}
          </p>
          <h1 className="mt-2 text-base font-bold leading-tight tracking-tight text-white">
            {appBrand.labName}
          </h1>
          <p className="mt-1.5 text-[11px] leading-5 text-sky-200/70 italic">
            {appBrand.shellTagline}
          </p>
          {/* info pills */}
          <div className="mt-3 flex flex-col gap-1 w-full">
            <span className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-[10px] text-sky-200/80">
              <span>📍</span> {appBrand.address}
            </span>
            <span className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-[10px] text-sky-200/80">
              <span>📞</span> {appBrand.phone}
            </span>
            <span className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-[10px] text-sky-200/80">
              <span>✉️</span> {appBrand.email}
            </span>
          </div>
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
        <p className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[0.3em] text-sky-400/60">
          Navigation
        </p>
        {items.map((item) => {
          const colors = item.colorKey ? (COLOR_MAP[item.colorKey] ?? DEFAULT_COLOR) : DEFAULT_COLOR;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "group flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                  isActive
                    ? cn("border-white/20 bg-white/95 shadow-lg", "text-slate-900")
                    : "border-transparent bg-white/5 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/15",
                )
              }
            >
              {({ isActive }) => {
                return (
                  <>
                    {/* Left: icon pill + label */}
                    <span className="flex items-center gap-2.5">
                      {/* Color pill with icon */}
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-base transition-all duration-200",
                          isActive
                            ? colors.active
                            : colors.inactive,
                        )}
                      >
                        {item.icon ?? "◉"}
                      </span>
                      <span className={cn(
                        "transition-colors duration-150",
                        isActive ? "text-slate-900" : "text-white/90 group-hover:text-white"
                      )}>
                        {item.label}
                      </span>
                    </span>

                    {/* Right: badge or active dot */}
                    {item.badge ? (
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-xs font-bold transition-all duration-150",
                          isActive
                            ? "border-slate-300/40 bg-slate-100 text-slate-700"
                            : "border-white/20 bg-white/10 text-white",
                        )}
                      >
                        {item.badge}
                      </span>
                    ) : isActive ? (
                      <span className={cn("h-2 w-2 rounded-full shrink-0", colors.dot)} />
                    ) : null}
                  </>
                );
              }}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Footer accent ────────────────────────────────────────────── */}
      <div className="border-t border-white/10 px-4 py-3">
        <p className="text-center text-[9px] font-semibold uppercase tracking-[0.25em] text-white/30">
          Lab EMR · Secure Portal
        </p>
      </div>
    </aside>
  );
}
