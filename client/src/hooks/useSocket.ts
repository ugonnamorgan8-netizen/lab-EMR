import { useEffect } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "../stores/authStore";
import { useNotificationStore } from "../stores/notificationStore";

const socket = io("http://localhost:4000", { autoConnect: false });

export function useSocket() {
  const user = useAuthStore((state) => state.user);
  const pushItem = useNotificationStore((state) => state.pushItem);

  useEffect(() => {
    if (!user) {
      socket.disconnect();
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
    });

    return () => {
      socket.off("notification:new");
    };
  }, [pushItem, user]);
}
