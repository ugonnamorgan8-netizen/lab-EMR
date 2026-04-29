import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { AdminAnalyticsPage } from "./modules/admin/AdminAnalyticsPage";
import { AdminAuditPage } from "./modules/admin/AdminAuditPage";
import { AdminCatalogPage } from "./modules/admin/AdminCatalogPage";
import { AdminSettingsPage } from "./modules/admin/AdminSettingsPage";
import { AdminUsersPage } from "./modules/admin/AdminUsersPage";
import { LoginPage } from "./modules/auth/LoginPage";
import { InvoicePage } from "./modules/billing/InvoicePage";
import { CollectionQueuePage } from "./modules/collection/CollectionQueuePage";
import { CollectionWorkspacePage } from "./modules/collection/CollectionWorkspacePage";
import { NewVisitPage } from "./modules/reception/NewVisitPage";
import { PatientsPage } from "./modules/reception/PatientsPage";
import { QueuePage } from "./modules/reception/QueuePage";
import { RegisterPage } from "./modules/reception/RegisterPage";
import { PlaceholderPage } from "./modules/shared/PlaceholderPage";
import { BillingDashboardPage } from "./modules/workflow/BillingDashboardPage";
import { DispatchQueuePage } from "./modules/workflow/DispatchQueuePage";
import { OutstandingInvoicesPage } from "./modules/workflow/OutstandingInvoicesPage";
import { PreanalyticsQueuePage } from "./modules/workflow/PreanalyticsQueuePage";
import { ProcessingWorklistPage } from "./modules/workflow/ProcessingWorklistPage";
import { QcDashboardPage } from "./modules/workflow/QcDashboardPage";
import { ResultReportPage } from "./modules/workflow/ResultReportPage";
import { ValidationQueuePage } from "./modules/workflow/ValidationQueuePage";
import { useAuthStore } from "./stores/authStore";
import type { NavItem, Role } from "./types/app";
import { appBrand } from "./utils/branding";
import { ROLE_PERMISSIONS } from "./utils/rolePermissions";

const navByRole: Record<Role, NavItem[]> = {
  RECEPTIONIST: [
    { label: "Register", to: "/reception/register", icon: "📝", colorKey: "sky" },
    { label: "New Visit", to: "/reception/new-visit", icon: "🏥", colorKey: "teal" },
  ],
  ACCOUNTS: [
    { label: "Dashboard", to: "/billing/dashboard", icon: "💰", colorKey: "emerald" },
    { label: "Payments", to: "/billing/outstanding", icon: "💳", colorKey: "amber" },
    { label: "Patients", to: "/reception/patients", icon: "👥", colorKey: "sky" },
  ],
  LAB_SCIENTIST: [
    { label: "Collection", to: "/collection/queue", icon: "🧪", colorKey: "teal" },
    { label: "Pre-analytics", to: "/preanalytics/queue", icon: "🔬", colorKey: "violet" },
    { label: "Processing", to: "/processing/worklist", icon: "⚗️", colorKey: "amber" },
    { label: "Test Setup", to: "/catalog/setup", icon: "📋", colorKey: "emerald" },
    { label: "Validation", to: "/validation/queue", icon: "✅", colorKey: "green" },
    { label: "QC", to: "/qc/dashboard", icon: "📊", colorKey: "rose" },
    { label: "Dispatch", to: "/dispatch/queue", icon: "📤", colorKey: "orange" },
    { label: "Patients", to: "/reception/patients", icon: "👥", colorKey: "sky" },
  ],
  SUPERVISOR: [
    { label: "Analytics", to: "/admin/analytics", icon: "📈", colorKey: "violet" },
    { label: "Register", to: "/reception/register", icon: "📝", colorKey: "sky" },
    { label: "Queue", to: "/reception/queue", icon: "🗂️", colorKey: "teal" },
    { label: "Collection", to: "/collection/queue", icon: "🧪", colorKey: "teal" },
    { label: "Processing", to: "/processing/worklist", icon: "⚗️", colorKey: "amber" },
    { label: "Validation", to: "/validation/queue", icon: "✅", colorKey: "green" },
    { label: "QC", to: "/qc/dashboard", icon: "📊", colorKey: "rose" },
    { label: "Dispatch", to: "/dispatch/queue", icon: "📤", colorKey: "orange" },
    { label: "Billing", to: "/billing/dashboard", icon: "💰", colorKey: "emerald" },
    { label: "Outstanding", to: "/billing/outstanding", icon: "💳", colorKey: "amber" },
    { label: "Users", to: "/admin/users", icon: "👤", colorKey: "indigo" },
    { label: "Settings", to: "/admin/settings", icon: "⚙️", colorKey: "slate" },
    { label: "Catalog", to: "/admin/catalog", icon: "🗄️", colorKey: "purple" },
    { label: "Audit", to: "/admin/audit", icon: "🔍", colorKey: "rose" },
  ],
};

const homeByRole: Record<Role, string> = {
  RECEPTIONIST: "/reception/register",
  ACCOUNTS: "/billing/dashboard",
  LAB_SCIENTIST: "/collection/queue",
  SUPERVISOR: "/admin/analytics",
};

function ProtectedLayout() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const permissions = ROLE_PERMISSIONS[user.role];
  const allowed =
    location.pathname === "/" ||
    permissions.includes("*") ||
    permissions.some((path) => location.pathname.startsWith(path));

  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  const navItems = [...navByRole[user.role]];

  return (
    <AppShell
      title="Laboratory Operations Workspace"
      subtitle={user.role.replaceAll("_", " ")}
      navItems={navItems}
      userName={user.name}
      userRole={user.role.replaceAll("_", " ")}
    >
      <Outlet />
    </AppShell>
  );
}

function HomeRedirect() {
  const user = useAuthStore((state) => state.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const firstAllowed = homeByRole[user.role] ?? navByRole[user.role][0]?.to ?? "/reception/register";
  return <Navigate to={firstAllowed} replace />;
}

export function App() {
  document.title = appBrand.labName;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedLayout />}>
        <Route index element={<HomeRedirect />} />
        <Route path="reception/register" element={<RegisterPage />} />
        <Route path="reception/new-visit" element={<NewVisitPage />} />
        <Route path="reception/queue" element={<QueuePage />} />
        <Route path="reception/patients" element={<PatientsPage />} />
        <Route path="collection/queue" element={<CollectionQueuePage />} />
        <Route path="collection/:visitId" element={<CollectionWorkspacePage />} />
        <Route path="billing/invoice/:visitId" element={<InvoicePage />} />
        <Route path="preanalytics/queue" element={<PreanalyticsQueuePage />} />
        <Route path="processing/worklist" element={<ProcessingWorklistPage />} />
        <Route path="catalog/setup" element={<AdminCatalogPage />} />
        <Route path="lab/configuration" element={<AdminSettingsPage />} />
        <Route path="qc/dashboard" element={<QcDashboardPage />} />
        <Route path="validation/queue" element={<ValidationQueuePage />} />
        <Route path="dispatch/queue" element={<DispatchQueuePage />} />
        <Route path="reports/visit/:visitId" element={<ResultReportPage />} />
        <Route
          path="referral/queue"
          element={<PlaceholderPage title="Referral queue" description="Send-out logging and referral result intake live here." />}
        />
        <Route path="billing/dashboard" element={<BillingDashboardPage />} />
        <Route path="billing/outstanding" element={<OutstandingInvoicesPage />} />
        <Route path="admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="admin/users" element={<AdminUsersPage />} />
        <Route path="admin/settings" element={<AdminSettingsPage />} />
        <Route path="admin/catalog" element={<AdminCatalogPage />} />
        <Route path="admin/audit" element={<AdminAuditPage />} />
      </Route>
    </Routes>
  );
}
