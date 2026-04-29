import { useNotificationStore } from "../../stores/notificationStore";
import { usePresenceStore } from "../../stores/presenceStore";
import { appBrand } from "../../utils/branding";
import { BrandLogo } from "../brand/BrandLogo";

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
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const clearUnread = useNotificationStore((state) => state.clearUnread);
  const activeUsers = usePresenceStore((state) => state.activeUsers);

  function handleAlertsClick() {
    clearUnread();
    setOpen(true);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.90),rgba(247,251,255,0.95))] px-4 py-2 backdrop-blur md:px-6 md:py-3">
      <div className="flex items-center justify-between gap-3">

        {/* Left: logo (mobile only) + title */}
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogo src={appBrand.logoPath} alt={appBrand.labName} size="sm" className="md:hidden shrink-0" imageClassName="h-8 w-8" />
          <div className="min-w-0">
            <p className="hidden text-xs font-semibold uppercase tracking-[0.28em] text-brand-blue md:block">
              {appBrand.shortName}
            </p>
            <h2 className="truncate text-base font-semibold tracking-tight text-slate-900 md:text-2xl">{title}</h2>
            <p className="truncate text-xs text-slate-500 md:text-sm">{subtitle || appBrand.labName}</p>
          </div>
        </div>

        {/* Right: info cards (desktop) + icon action buttons */}
        <div className="flex shrink-0 items-center gap-2 md:gap-3">

          {/* Info cards — desktop only */}
          <div className="hidden gap-3 md:flex">
            {/* Signed-in card */}
            <div className="flex items-center gap-3 rounded-2xl border border-brand-border bg-white/80 px-4 py-2.5 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg text-white shadow">
                🧑‍⚕️
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-blue">Signed in</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">{userName}</p>
                <p className="text-xs text-slate-500">{userRole}</p>
              </div>
            </div>

            {/* Online users card */}
            <div className="flex items-center gap-3 rounded-2xl border border-brand-border bg-white/80 px-4 py-2.5 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-lg text-white shadow">
                🌐
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-blue">Online now</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">{activeUsers}</p>
                <p className="text-xs text-slate-500">
                  {activeUsers === 1 ? "1 connected" : `${activeUsers} connected`}
                </p>
              </div>
            </div>
          </div>

          {/* ── Alerts icon button ── */}
          <button
            type="button"
            onClick={handleAlertsClick}
            className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-border bg-white/80 text-xl shadow-sm transition-all duration-150 hover:scale-105 hover:bg-amber-50 hover:border-amber-300 hover:shadow-md md:h-12 md:w-12"
            title="Alerts"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* ── Logout icon button ── */}
          <button
            type="button"
            onClick={onLogout}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-border bg-white/80 text-xl shadow-sm transition-all duration-150 hover:scale-105 hover:bg-rose-50 hover:border-rose-300 hover:shadow-md md:h-12 md:w-12"
            title="Logout"
          >
            🚪
          </button>
        </div>
      </div>
    </header>
  );
}
