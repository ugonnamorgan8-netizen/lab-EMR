import { roles, userStatuses } from "@shared/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import type { AdminUsersResponse } from "../../types/app";
import { formatDate } from "../../utils/formatDate";

type UserDraft = {
  role: string;
  status: string;
  department: string;
};

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </Card>
  );
}

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, UserDraft>>({});
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const usersQuery = useQuery({
    queryKey: queryKeys.adminUsers(),
    queryFn: async () => {
      const response = await api.get("/admin/users");
      return response.data as AdminUsersResponse;
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ userId, payload }: { userId: string; payload: { role: string; status: string; department: string } }) => {
      const response = await api.patch(`/admin/users/${userId}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminAudit() });
    },
    onSettled: () => {
      setSavingUserId(null);
    },
  });

  if (usersQuery.isLoading) {
    return <Skeleton className="h-72 w-full" />;
  }

  if (usersQuery.isError || !usersQuery.data) {
    return <EmptyState title="Users unavailable" message="The user roster could not be loaded right now." />;
  }

  const rolesInUse = Object.entries(usersQuery.data.byRole).filter(([, count]) => count > 0);

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
          {rolesInUse.map(([role, count]) => (
            <Badge key={role} className="bg-slate-100 text-slate-700">
              {role.replaceAll("_", " ")}: {count}
            </Badge>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">User directory</h3>
          <p className="text-sm text-slate-500">Admins can adjust roles, statuses, and departmental placement here.</p>
        </div>
        {usersQuery.data.users.length === 0 ? (
          <EmptyState title="No users found" message="Seeded or created users will appear here." />
        ) : (
          <div className="space-y-3">
            {usersQuery.data.users.map((user) => {
              const draft = drafts[user.id] ?? {
                role: user.role,
                status: user.status,
                department: user.department ?? "",
              };
              const isDirty =
                draft.role !== user.role || draft.status !== user.status || draft.department !== (user.department ?? "");

              return (
                <div key={user.id} className="rounded-xl border border-brand-border p-3">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-500">
                          {user.email} - created {formatDate(user.createdAt)} - last login {user.lastLogin ? formatDate(user.lastLogin) : "Never"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-blue-100 text-brand-blue">{user.role.replaceAll("_", " ")}</Badge>
                        <Badge className="bg-slate-100 text-slate-700">{user.status}</Badge>
                      </div>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
                      <label className="space-y-1 text-sm text-slate-600">
                        <span>Role</span>
                        <select
                          className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                          value={draft.role}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [user.id]: {
                                ...draft,
                                role: event.target.value,
                              },
                            }))
                          }
                        >
                          {roles.map((role) => (
                            <option key={role} value={role}>
                              {role.replaceAll("_", " ")}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="space-y-1 text-sm text-slate-600">
                        <span>Status</span>
                        <select
                          className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                          value={draft.status}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [user.id]: {
                                ...draft,
                                status: event.target.value,
                              },
                            }))
                          }
                        >
                          {userStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="space-y-1 text-sm text-slate-600">
                        <span>Department</span>
                        <input
                          className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                          value={draft.department}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [user.id]: {
                                ...draft,
                                department: event.target.value,
                              },
                            }))
                          }
                          placeholder="Department"
                        />
                      </label>

                      <div className="flex items-end gap-2">
                        <Button
                          disabled={!isDirty || (updateUser.isPending && savingUserId === user.id)}
                          onClick={() => {
                            setSavingUserId(user.id);
                            updateUser.mutate({
                              userId: user.id,
                              payload: {
                                role: draft.role,
                                status: draft.status,
                                department: draft.department,
                              },
                            });
                          }}
                        >
                          {updateUser.isPending && savingUserId === user.id ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          variant="secondary"
                          disabled={!isDirty}
                          onClick={() =>
                            setDrafts((current) => {
                              const next = { ...current };
                              delete next[user.id];
                              return next;
                            })
                          }
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
