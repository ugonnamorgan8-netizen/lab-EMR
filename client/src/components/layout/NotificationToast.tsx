import { useEffect } from "react";
import { useNotificationStore } from "../../stores/notificationStore";

/**
 * Floating toast that slides in from the top-right whenever a new
 * notification is pushed via the socket. Auto-dismissed after 4 s
 * (the timer is managed in useSocket); clicking the × clears it immediately.
 */
export function NotificationToast() {
  const toast = useNotificationStore((state) => state.toast);
  const setToast = useNotificationStore((state) => state.setToast);

  // Keyboard escape to dismiss
  useEffect(() => {
    if (!toast) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setToast(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toast, setToast]);

  if (!toast) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed right-4 top-4 z-50 w-80 animate-[slideInRight_0.25s_ease-out] rounded-2xl border border-brand-border bg-white shadow-[0_20px_48px_rgba(12,41,82,0.18)]"
    >
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Bell icon */}
        <span className="mt-0.5 text-lg" aria-hidden="true">🔔</span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{toast.title}</p>
          <p className="mt-0.5 text-xs leading-snug text-slate-500 line-clamp-2">{toast.message}</p>
        </div>

        {/* Dismiss button */}
        <button
          onClick={() => setToast(null)}
          aria-label="Dismiss notification"
          className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition duration-150"
        >
          ✕
        </button>
      </div>

      {/* Progress bar — purely visual, matches the 4 s auto-dismiss */}
      <div className="overflow-hidden rounded-b-2xl">
        <div className="h-0.5 w-full origin-left animate-[shrinkX_4s_linear_forwards] bg-brand-blue" />
      </div>
    </div>
  );
}
