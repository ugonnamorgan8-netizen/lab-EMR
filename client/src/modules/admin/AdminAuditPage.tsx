import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "../../components/shared/MetricCard";
import { PageHero } from "../../components/shared/PageHero";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import type { AuditLogItem } from "../../types/app";
import { formatDate } from "../../utils/formatDate";

function formatMetadata(metadata: unknown) {
  if (!metadata) return "No metadata";
  try {
    return JSON.stringify(metadata);
  } catch {
    return "Metadata unavailable";
  }
}

const ACTION_ICONS: Record<string, string> = {
  CREATE: "➕",
  UPDATE: "✏️",
  DELETE: "🗑️",
  LOGIN:  "🔑",
  LOGOUT: "🚪",
  PATCH:  "🔧",
  VIEW:   "👁️",
};

export function AdminAuditPage() {
  const auditQuery = useQuery({
    queryKey: queryKeys.adminAudit(),
    queryFn: async () => {
      const response = await api.get("/admin/audit");
      return response.data as AuditLogItem[];
    },
  });

  if (auditQuery.isLoading) {
    return <Skeleton className="h-72 w-full" />;
  }

  if (auditQuery.isError || !auditQuery.data) {
    return <EmptyState title="Audit unavailable" message="Operational audit events could not be loaded right now." />;
  }

  const totalEvents = auditQuery.data.length;
  const uniqueUsers = new Set(auditQuery.data.map((log) => log.user.email)).size;
  const deleteEvents = auditQuery.data.filter((log) => log.action === "DELETE").length;

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Security & Compliance"
        title="Audit trail"
        description="Latest 50 tracked operational events. Every create, update, delete, and login is logged with user identity, IP address, and resource context."
        aside={<div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-100">Events: {totalEvents}</div>}
      />

      {/* ── Summary cards ────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Logged events"
          value={totalEvents}
          hint="Total audit records currently visible"
          icon="🔍"
          variant="indigo"
        />
        <MetricCard
          label="Active users"
          value={uniqueUsers}
          hint="Distinct users with activity in this log"
          icon="🧑‍💻"
          variant="blue"
        />
        <MetricCard
          label="Delete actions"
          value={deleteEvents}
          hint="Destructive operations requiring review"
          icon="🗑️"
          variant="rose"
        />
      </div>

      {/* ── Audit log ────────────────────────────────────────────────── */}
      <Card variant="gradient" className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-700 text-xl text-white shadow">
            📋
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Recent audit activity</h3>
            <p className="text-sm text-slate-500">Latest 50 tracked operational events from the deployed system</p>
          </div>
        </div>

        {auditQuery.data.length === 0 ? (
          <EmptyState title="No audit records" message="Tracked actions will appear here once users interact with the system." />
        ) : (
          <div className="space-y-3">
            {auditQuery.data.map((log) => (
              <div key={log.id} className="rounded-2xl border border-brand-border bg-white/70 p-3 shadow-sm transition-all duration-150 hover:shadow-md">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-3">
                    {/* Action icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-blue-50 text-xl shadow-sm">
                      {ACTION_ICONS[log.action] ?? "📝"}
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-blue-100 text-brand-blue">{log.action}</Badge>
                        <Badge className="bg-slate-100 text-slate-700">{log.resourceType}</Badge>
                      </div>
                      <p className="mt-2 font-semibold text-slate-900">
                        {log.user.name} · {log.user.role.replaceAll("_", " ")}
                      </p>
                      <p className="text-sm text-slate-500">
                        {log.user.email} · resource {log.resourceId}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">{formatMetadata(log.metadata)}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-sm text-slate-500 md:text-right">
                    <p className="flex items-center gap-1 md:justify-end"><span>🕐</span>{formatDate(log.createdAt)}</p>
                    <p className="flex items-center gap-1 md:justify-end"><span>🌐</span>{log.ipAddress ?? "No IP captured"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
