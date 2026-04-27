import { useNotificationStore } from "../../stores/notificationStore";
import { Button } from "../ui/Button";

export function Topbar({ title, subtitle, onLogout }: { title: string; subtitle?: string; onLogout: () => void }) {
  const setOpen = useNotificationStore((state) => state.setOpen);

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-white/78 px-4 py-4 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-blue">Operational workspace</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
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
