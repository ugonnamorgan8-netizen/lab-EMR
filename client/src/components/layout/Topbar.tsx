import { useNotificationStore } from "../../stores/notificationStore";
import { appBrand } from "../../utils/branding";
import { Button } from "../ui/Button";

export function Topbar({ title, subtitle, onLogout }: { title: string; subtitle?: string; onLogout: () => void }) {
  const setOpen = useNotificationStore((state) => state.setOpen);

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(247,251,255,0.92))] px-4 py-4 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-brand-border/70 bg-white/90 shadow-[0_12px_24px_rgba(15,47,88,0.08)] md:hidden">
            <img src={appBrand.logoPath} alt={appBrand.labName} className="h-9 w-9 object-contain" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-blue">{appBrand.shortName}</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{subtitle || appBrand.labName}</p>
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
    </header>
  );
}
