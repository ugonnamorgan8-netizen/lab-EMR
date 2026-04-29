import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import { useNotificationStore } from "../../stores/notificationStore";
import { formatDate } from "../../utils/formatDate";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";

export function NotificationDrawer() {
  const open = useNotificationStore((state) => state.open);
  const setOpen = useNotificationStore((state) => state.setOpen);
  const items = useNotificationStore((state) => state.items);
  const setItems = useNotificationStore((state) => state.setItems);
  const clearUnread = useNotificationStore((state) => state.clearUnread);

  // Reset badge count whenever the drawer becomes visible
  useEffect(() => {
    if (open) clearUnread();
  }, [open, clearUnread]);

  useQuery({
    queryKey: queryKeys.notifications(),
    queryFn: async () => {
      const response = await api.get("/notifications");
      setItems(response.data);
      return response.data;
    },
  });

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/20">
      <div className="absolute bottom-0 right-0 h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-brand-border bg-brand-surface p-4 md:h-full md:rounded-none">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <span aria-hidden="true">🔔</span>
            Notifications
          </div>
          <button onClick={() => setOpen(false)}>
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <div className="space-y-3">
          {items.length === 0 ? (
            <EmptyState title="No notifications yet" message="Live alerts will appear here as they arrive." />
          ) : (
            items.map((item) => (
              <Card key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                  </div>
                  <span className="text-xs text-slate-500">{formatDate(item.createdAt)}</span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
