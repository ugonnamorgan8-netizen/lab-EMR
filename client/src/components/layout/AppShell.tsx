import type { PropsWithChildren } from "react";
import type { NavItem } from "../../types/app";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../hooks/useSocket";
import { BottomTabBar } from "./BottomTabBar";
import { NotificationDrawer } from "./NotificationDrawer";
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
    <div className="min-h-screen bg-transparent md:flex">
      <Sidebar items={navItems} />
      <div className="flex min-h-screen flex-1 flex-col pb-24 md:pb-0">
        <Topbar title={title} subtitle={subtitle} userName={userName} userRole={userRole} onLogout={logout} />
        <PatientContextBanner />
        <main className="flex-1 px-4 py-5 md:px-6 md:py-6">{children}</main>
      </div>
      <BottomTabBar items={navItems} />
      <NotificationDrawer />
    </div>
  );
}
