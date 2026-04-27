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
import { useAuthStore } from "./stores/authStore";
import { ROLE_PERMISSIONS } from "./utils/rolePermissions";

const navByRole = {
  RECEPTIONIST: [
    { label: "Register", to: "/reception/register" },
    { label: "New Visit", to: "/reception/new-visit" },
    { label: "Queue", to: "/reception/queue" },
    { label: "Patients", to: "/reception/patients" },
    { label: "Billing", to: "/billing/invoice/demo" },
  ],
  PHLEBOTOMIST: [
    { label: "Collect", to: "/collection/queue" },
    { label: "Queue", to: "/reception/queue" },
    { label: "Pre-analytics", to: "/preanalytics/queue" },
    { label: "Patients", to: "/reception/patients" },
  ],
  LAB_SCIENTIST: [
    { label: "Processing", to: "/processing/worklist" },
    { label: "Validation", to: "/validation/queue" },
    { label: "QC", to: "/qc/dashboard" },
    { label: "Dispatch", to: "/dispatch/queue" },
  ],
  LAB_TECHNICIAN: [
    { label: "Processing", to: "/processing/worklist" },
    { label: "Pre-analytics", to: "/preanalytics/queue" },
    { label: "Patients", to: "/reception/patients" },
  ],
  QC_OFFICER: [
    { label: "QC", to: "/qc/dashboard" },
    { label: "Processing", to: "/processing/worklist" },
    { label: "Patients", to: "/reception/patients" },
  ],
  DISPATCH_OFFICER: [
    { label: "Dispatch", to: "/dispatch/queue" },
    { label: "Validation", to: "/validation/queue" },
    { label: "Patients", to: "/reception/patients" },
  ],
  ACCOUNTANT: [
    { label: "Billing", to: "/billing/dashboard" },
    { label: "Outstanding", to: "/billing/outstanding" },
    { label: "Patients", to: "/reception/patients" },
  ],
  LAB_MANAGER: [
    { label: "Analytics", to: "/admin/analytics" },
    { label: "Queue", to: "/reception/queue" },
    { label: "QC", to: "/qc/dashboard" },
    { label: "Billing", to: "/billing/dashboard" },
    { label: "Users", to: "/admin/users" },
  ],
  ADMIN: [
    { label: "Analytics", to: "/admin/analytics" },
    { label: "Settings", to: "/admin/settings" },
    { label: "Users", to: "/admin/users" },
    { label: "Catalog", to: "/admin/catalog" },
    { label: "Audit", to: "/admin/audit" },
  ],
} as const;

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
      title="Lab Operations"
      subtitle={user.role.replaceAll("_", " ")}
      navItems={navItems}
      userLabel={`${user.name} - ${user.role.replaceAll("_", " ")}`}
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

  const firstAllowed = navByRole[user.role][0]?.to ?? "/reception/register";
  return <Navigate to={firstAllowed} replace />;
}

export function App() {
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
        <Route
          path="preanalytics/queue"
          element={<PlaceholderPage title="Pre-analytics queue" description="Tracking, receive, and centrifuge screens land here next." />}
        />
        <Route
          path="processing/worklist"
          element={<PlaceholderPage title="Processing worklist" description="Bench analysis, result entry, and delta check workflow will mount here." />}
        />
        <Route
          path="qc/dashboard"
          element={<PlaceholderPage title="QC dashboard" description="Westgard rules, QC entry, and Levey-Jennings charts are queued for the next build slice." />}
        />
        <Route
          path="validation/queue"
          element={<PlaceholderPage title="Validation queue" description="Scientific review and critical result acknowledgement workspace will appear here." />}
        />
        <Route
          path="dispatch/queue"
          element={<PlaceholderPage title="Dispatch queue" description="Report preview, dispatch actions, and amendment history will live here." />}
        />
        <Route
          path="referral/queue"
          element={<PlaceholderPage title="Referral queue" description="Send-out logging and referral result intake live here." />}
        />
        <Route
          path="billing/dashboard"
          element={<PlaceholderPage title="Billing dashboard" description="Revenue, outstanding balances, and corporate billing analytics live here." />}
        />
        <Route
          path="billing/outstanding"
          element={<PlaceholderPage title="Outstanding invoices" description="Ageing buckets and reminder workflows will render here." />}
        />
        <Route path="admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="admin/users" element={<AdminUsersPage />} />
        <Route path="admin/settings" element={<AdminSettingsPage />} />
        <Route path="admin/catalog" element={<AdminCatalogPage />} />
        <Route path="admin/audit" element={<AdminAuditPage />} />
      </Route>
    </Routes>
  );
}
