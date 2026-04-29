import { useNotificationStore } from "../../stores/notificationStore";
import { usePresenceStore } from "../../stores/presenceStore";
import { appBrand } from "../../utils/branding";
import { BrandLogo } from "../brand/BrandLogo";
import { Button } from "../ui/Button";

export function Topbar({
  title,
  subtitle,
  userName,
  userRole,
  onLogout,
}: {
  title: string;
  subtitle?: string;
  userName: string;
  userRole: string;
  onLogout: () => void;
}) {
  const setOpen = useNotificationStore((state) => state.setOpen);
  const activeUsers = usePresenceStore((state) => state.activeUsers);

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(247,251,255,0.92))] px-4 py-2 backdrop-blur md:px-6 md:py-4">
      {/* ── Single compact row on mobile, expands to two-section row on desktop ── */}
      <div className="flex items-center justify-between gap-3">

        {/* Left: logo (mobile only) + title */}
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogo src={appBrand.logoPath} alt={appBrand.labName} size="sm" className="md:hidden shrink-0" imageClassName="h-8 w-8" />
          <div className="min-w-0">
            <p className="hidden text-xs font-semibold uppercase tracking-[0.28em] text-brand-blue md:block">{appBrand.shortName}</p>
            <h2 className="truncate text-base font-semibold tracking-tight text-slate-900 md:text-2xl">{title}</h2>
            <p className="truncate text-xs text-slate-500 md:text-sm">{subtitle || appBrand.labName}</p>
          </div>
        </div>

        {/* Right: info cards (desktop only) + action buttons */}
        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          {/* Info cards — hidden on mobile, shown side-by-side on md+ */}
          <div className="hidden gap-3 md:flex">
            <div className="rounded-2xl border border-brand-border bg-white/80 px-4 py-3 text-left shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-blue">Signed in</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{userName}</p>
              <p className="mt-1 text-xs text-slate-500">{userRole}</p>
            </div>
            <div className="rounded-2xl border border-brand-border bg-white/80 px-4 py-3 text-left shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-blue">Online now</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{activeUsers}</p>
              <p className="mt-1 text-xs text-slate-500">
                {activeUsers === 1 ? "1 account connected" : `${activeUsers} accounts connected`}
              </p>
            </div>
          </div>

          {/* Action buttons — always visible */}
          <Button variant="secondary" className="px-3 text-xs md:px-4 md:text-sm" onClick={() => setOpen(true)}>
            Alerts
          </Button>
          <Button variant="secondary" className="text-xs md:text-sm" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
