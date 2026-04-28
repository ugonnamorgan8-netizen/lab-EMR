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
    { label: "Register", to: "/reception/register" },
    { label: "New Visit", to: "/reception/new-visit" },
  ],
  ACCOUNTS: [
    { label: "Dashboard", to: "/billing/dashboard" },
    { label: "Payments", to: "/billing/outstanding" },
    { label: "Patients", to: "/reception/patients" },
  ],
  LAB_SCIENTIST: [
    { label: "Collection", to: "/collection/queue" },
    { label: "Pre-analytics", to: "/preanalytics/queue" },
    { label: "Processing", to: "/processing/worklist" },
    { label: "Test Setup", to: "/catalog/setup" },
    { label: "Lab Config", to: "/lab/configuration" },
    { label: "Validation", to: "/validation/queue" },
    { label: "QC", to: "/qc/dashboard" },
    { label: "Dispatch", to: "/dispatch/queue" },
    { label: "Patients", to: "/reception/patients" },
  ],
  SUPERVISOR: [
    { label: "Analytics", to: "/admin/analytics" },
    { label: "Register", to: "/reception/register" },
    { label: "Queue", to: "/reception/queue" },
    { label: "Collection", to: "/collection/queue" },
    { label: "Processing", to: "/processing/worklist" },
    { label: "Validation", to: "/validation/queue" },
    { label: "QC", to: "/qc/dashboard" },
    { label: "Dispatch", to: "/dispatch/queue" },
    { label: "Billing", to: "/billing/dashboard" },
    { label: "Outstanding", to: "/billing/outstanding" },
    { label: "Users", to: "/admin/users" },
    { label: "Settings", to: "/admin/settings" },
    { label: "Catalog", to: "/admin/catalog" },
    { label: "Audit", to: "/admin/audit" },
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
