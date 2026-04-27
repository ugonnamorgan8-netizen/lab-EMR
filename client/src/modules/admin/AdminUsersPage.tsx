import { useQuery } from "@tanstack/react-query";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import type { AdminUsersResponse } from "../../types/app";
import { formatDate } from "../../utils/formatDate";

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </Card>
  );
}

export function AdminUsersPage() {
  const usersQuery = useQuery({
    queryKey: queryKeys.adminUsers(),
    queryFn: async () => {
      const response = await api.get("/admin/users");
      return response.data as AdminUsersResponse;
    },
  });

  if (usersQuery.isLoading) {
    return <Skeleton className="h-72 w-full" />;
  }

  if (usersQuery.isError || !usersQuery.data) {
    return <EmptyState title="Users unavailable" message="The user roster could not be loaded right now." />;
  }

  const roles = Object.entries(usersQuery.data.byRole).filter(([, count]) => count > 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total users" value={usersQuery.data.totals.total} />
        <SummaryCard label="Active" value={usersQuery.data.totals.active} />
        <SummaryCard label="Inactive" value={usersQuery.data.totals.inactive} />
        <SummaryCard label="Suspended" value={usersQuery.data.totals.suspended} />
      </div>

      <Card className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Role coverage</h3>
          <p className="text-sm text-slate-500">Current user distribution across departments and functions</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {roles.map(([role, count]) => (
            <Badge key={role} className="bg-slate-100 text-slate-700">
              {role.replaceAll("_", " ")}: {count}
            </Badge>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">User directory</h3>
          <p className="text-sm text-slate-500">Read-only operational roster for deployed demo accounts</p>
        </div>
        {usersQuery.data.users.length === 0 ? (
          <EmptyState title="No users found" message="Seeded or created users will appear here." />
        ) : (
          <div className="space-y-3">
            {usersQuery.data.users.map((user) => (
              <div key={user.id} className="rounded-xl border border-brand-border p-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-500">
                      {user.email} · {user.department ?? "No department"} · created {formatDate(user.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-100 text-brand-blue">{user.role.replaceAll("_", " ")}</Badge>
                    <Badge className="bg-slate-100 text-slate-700">{user.status}</Badge>
                    <Badge className="bg-emerald-100 text-emerald-700">
                      Last login: {user.lastLogin ? formatDate(user.lastLogin) : "Never"}
                    </Badge>
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
