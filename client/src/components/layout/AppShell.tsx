import type { PropsWithChildren } from "react";
import type { NavItem } from "../../types/app";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../hooks/useSocket";
import { BottomTabBar } from "./BottomTabBar";
import { NotificationDrawer } from "./NotificationDrawer";
import { NotificationToast } from "./NotificationToast";
import { PatientContextBanner } from "./PatientContextBanner";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({
  title,
  subtitle,
  navItems,
  userName,
  userRole,
  children,
}: PropsWithChildren<{ title: string; subtitle?: string; navItems: NavItem[]; userName: string; userRole: string }>) {
  const { logout } = useAuth();
  useSocket();

  return (
    // Desktop: lock to viewport height so sidebar is fixed and only content scrolls.
    // Mobile: block flow (sidebar hidden, content min-h-screen with bottom bar padding).
    <div className="bg-transparent md:flex md:h-screen md:overflow-hidden">
      <Sidebar items={navItems} />
      <div className="flex min-h-screen flex-1 flex-col pb-24 md:min-h-0 md:overflow-y-auto md:pb-0">
        <Topbar title={title} subtitle={subtitle} userName={userName} userRole={userRole} onLogout={logout} />
        <PatientContextBanner />
        <main className="flex-1 px-4 py-5 md:px-6 md:py-6">{children}</main>
      </div>
      <BottomTabBar items={navItems} />
      <NotificationDrawer />
      <NotificationToast />
    </div>
  );
}
