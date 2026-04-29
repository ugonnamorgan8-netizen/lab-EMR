import { useEffect } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "../stores/authStore";
import { useNotificationStore } from "../stores/notificationStore";
import { usePresenceStore } from "../stores/presenceStore";

const socketUrl =
  import.meta.env.VITE_SOCKET_URL ??
  (import.meta.env.DEV ? "http://localhost:4000" : window.location.origin);

const socket = io(socketUrl, { autoConnect: false, withCredentials: true });

export function useSocket() {
  const user = useAuthStore((state) => state.user);
  const pushItem = useNotificationStore((state) => state.pushItem);
  const setToast = useNotificationStore((state) => state.setToast);
  const setActiveUsers = usePresenceStore((state) => state.setActiveUsers);
  const resetPresence = usePresenceStore((state) => state.reset);

  useEffect(() => {
    if (!user) {
      socket.disconnect();
      resetPresence();
      return;
    }

    socket.connect();
    socket.emit("join:user", user.id);
    socket.emit("join:role", user.role);
    if (user.department) {
      socket.emit("join:department", user.department);
    }

    socket.on("notification:new", (event) => {
      pushItem(event.notification);
      // Show floating toast, auto-dismiss after 4 s
      setToast(event.notification);
      setTimeout(() => setToast(null), 4000);
    });
    socket.on("presence:update", (event: { activeUsers: number }) => {
      setActiveUsers(event.activeUsers);
    });

    return () => {
      socket.off("notification:new");
      socket.off("presence:update");
    };
  }, [pushItem, resetPresence, setActiveUsers, setToast, user]);
}
