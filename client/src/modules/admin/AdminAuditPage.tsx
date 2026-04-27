import { useQuery } from "@tanstack/react-query";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import type { AuditLogItem } from "../../types/app";
import { formatDate } from "../../utils/formatDate";

function formatMetadata(metadata: unknown) {
  if (!metadata) {
    return "No metadata";
  }

  try {
    return JSON.stringify(metadata);
  } catch {
    return "Metadata unavailable";
  }
}

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

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Recent audit activity</h3>
          <p className="text-sm text-slate-500">Latest 50 tracked operational events from the deployed system</p>
        </div>
        {auditQuery.data.length === 0 ? (
          <EmptyState title="No audit records" message="Tracked actions will appear here once users interact with the system." />
        ) : (
          <div className="space-y-3">
            {auditQuery.data.map((log) => (
              <div key={log.id} className="rounded-xl border border-brand-border p-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
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
                  <div className="text-sm text-slate-500 md:text-right">
                    <p>{formatDate(log.createdAt)}</p>
                    <p>{log.ipAddress ?? "No IP captured"}</p>
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
