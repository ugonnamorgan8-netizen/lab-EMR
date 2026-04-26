import { useNotificationStore } from "../../stores/notificationStore";
import { Button } from "../ui/Button";

export function Topbar({ title, subtitle, onLogout }: { title: string; subtitle?: string; onLogout: () => void }) {
  const setOpen = useNotificationStore((state) => state.setOpen);

  return (
    <header className="border-b border-brand-border bg-white px-4 py-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="px-3" onClick={() => setOpen(true)}>
            <span aria-hidden="true">🔔</span>
          </Button>
          <Button variant="secondary" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
