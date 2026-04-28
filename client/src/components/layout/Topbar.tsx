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
    <header className="sticky top-0 z-20 border-b border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(247,251,255,0.92))] px-4 py-4 backdrop-blur md:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <BrandLogo src={appBrand.logoPath} alt={appBrand.labName} size="sm" className="md:hidden" imageClassName="h-8 w-8" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-blue">{appBrand.shortName}</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{subtitle || appBrand.labName}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="grid gap-3 sm:grid-cols-2">
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
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="px-4" onClick={() => setOpen(true)}>
              Alerts
            </Button>
            <Button variant="secondary" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
