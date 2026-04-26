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
  userLabel,
  children,
}: PropsWithChildren<{ title: string; subtitle?: string; navItems: NavItem[]; userLabel: string }>) {
  const { logout } = useAuth();
  useSocket();

  return (
    <div className="min-h-screen bg-brand-surface md:flex">
      <Sidebar items={navItems} userLabel={userLabel} />
      <div className="flex min-h-screen flex-1 flex-col pb-16 md:pb-0">
        <Topbar title={title} subtitle={subtitle} onLogout={logout} />
        <PatientContextBanner />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
      <BottomTabBar items={navItems} />
      <NotificationDrawer />
    </div>
  );
}
