import { roles, userStatuses } from "@shared/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import type { AdminUserRecord, AdminUsersResponse, DeleteAdminUserResponse } from "../../types/app";
import { formatDate } from "../../utils/formatDate";

type UserDraft = {
  role: string;
  status: string;
  department: string;
};

type CreateAccountDraft = {
  name: string;
  email: string;
  password: string;
  role: string;
  status: string;
  department: string;
};

function passwordChecks(password: string) {
  return {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </Card>
  );
}

function downloadArchive(user: AdminUserRecord, response: DeleteAdminUserResponse) {
  if (!response.archive) {
    return;
  }

  const fileName = `${user.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "user"}-archive.json`;
  const blob = new Blob([JSON.stringify(response.archive, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, UserDraft>>({});
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [createDraft, setCreateDraft] = useState<CreateAccountDraft>({
    name: "",
    email: "",
    password: "",
    role: "RECEPTIONIST",
    status: "ACTIVE",
    department: "",
  });
  const usersQuery = useQuery({
    queryKey: queryKeys.adminUsers(),
    queryFn: async () => {
      const response = await api.get("/admin/users");
      return response.data as AdminUsersResponse;
    },
  });
  const passwordRules = passwordChecks(createDraft.password);

  const createUser = useMutation({
    mutationFn: async (payload: CreateAccountDraft) => {
      const response = await api.post("/admin/users", payload);
      return response.data as AdminUserRecord;
    },
    onSuccess: () => {
      setCreateDraft({
        name: "",
        email: "",
        password: "",
        role: "RECEPTIONIST",
        status: "ACTIVE",
        department: "",
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminAudit() });
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ userId, payload }: { userId: string; payload: { role: string; status: string; department: string } }) => {
      const response = await api.patch(`/admin/users/${userId}`, payload);
      return response.data as AdminUserRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminAudit() });
    },
    onSettled: () => {
      setSavingUserId(null);
    },
  });

  const deleteUser = useMutation({
    mutationFn: async ({ userId, preserveData }: { userId: string; preserveData: boolean }) => {
      const response = await api.delete(`/admin/users/${userId}`, {
        params: { preserveData },
      });
      return response.data as DeleteAdminUserResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminAudit() });
    },
    onSettled: () => {
      setDeletingUserId(null);
    },
  });

  if (usersQuery.isLoading) {
    return <Skeleton className="h-72 w-full" />;
  }

  if (usersQuery.isError || !usersQuery.data) {
    return <EmptyState title="Users unavailable" message="The user roster could not be loaded right now." />;
  }

  const rolesInUse = Object.entries(usersQuery.data.byRole).filter(([, count]) => count > 0);
  const createDisabled =
    !createDraft.name.trim() ||
    !createDraft.email.trim() ||
    !Object.values(passwordRules).every(Boolean) ||
    createUser.isPending;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total users" value={usersQuery.data.totals.total} />
        <SummaryCard label="Active" value={usersQuery.data.totals.active} />
        <SummaryCard label="Inactive" value={usersQuery.data.totals.inactive} />
        <SummaryCard label="Suspended" value={usersQuery.data.totals.suspended} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Create account</h3>
            <p className="text-sm text-slate-500">Supervisors can create accounts with immediate access and place them into any supported role. Use a strong password with uppercase, lowercase, number, and symbol.</p>
          </div>

          <div className="grid gap-3">
            <Input
              label="Full name"
              value={createDraft.name}
              onChange={(event) => setCreateDraft((current) => ({ ...current, name: event.target.value }))}
              placeholder="e.g. Jane Doe"
            />
            <Input
              label="Email"
              value={createDraft.email}
              onChange={(event) => setCreateDraft((current) => ({ ...current, email: event.target.value }))}
              placeholder="user@stdavidmedicaldiagnostic.org.ng"
            />
            <Input
              label="Temporary password"
              type="password"
              value={createDraft.password}
              onChange={(event) => setCreateDraft((current) => ({ ...current, password: event.target.value }))}
              placeholder="Minimum 8 chars with upper, lower, number, symbol"
            />
            <div className="grid gap-1 rounded-xl border border-brand-border bg-brand-surface/50 px-3 py-3 text-xs text-slate-600">
              <p className={passwordRules.length ? "text-emerald-700" : "text-slate-500"}>At least 8 characters</p>
              <p className={passwordRules.lowercase ? "text-emerald-700" : "text-slate-500"}>Contains a lowercase letter</p>
              <p className={passwordRules.uppercase ? "text-emerald-700" : "text-slate-500"}>Contains an uppercase letter</p>
              <p className={passwordRules.number ? "text-emerald-700" : "text-slate-500"}>Contains a number</p>
              <p className={passwordRules.symbol ? "text-emerald-700" : "text-slate-500"}>Contains a symbol</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-600">
                <span>Role</span>
                <select
                  className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2"
                  value={createDraft.role}
                  onChange={(event) => setCreateDraft((current) => ({ ...current, role: event.target.value }))}
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
                  value={createDraft.status}
                  onChange={(event) => setCreateDraft((current) => ({ ...current, status: event.target.value }))}
                >
                  {userStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <Input
              label="Department"
              value={createDraft.department}
              onChange={(event) => setCreateDraft((current) => ({ ...current, department: event.target.value }))}
              placeholder="Reception, Accounts, Laboratory..."
            />
          </div>

          <Button
            disabled={createDisabled}
            onClick={() =>
              createUser.mutate({
                ...createDraft,
                name: createDraft.name.trim(),
                email: createDraft.email.trim(),
                department: createDraft.department.trim(),
              })
            }
          >
            {createUser.isPending ? "Creating..." : "Create account"}
          </Button>
          {createUser.error ? <p className="text-sm text-brand-red">{createUser.error.message}</p> : null}
        </Card>

        <Card className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Role coverage</h3>
            <p className="text-sm text-slate-500">Current user distribution across departments and functions.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {rolesInUse.map(([role, count]) => (
              <Badge key={role} className="bg-slate-100 text-slate-700">
                {role.replaceAll("_", " ")}: {count}
              </Badge>
            ))}
          </div>
          <div className="rounded-2xl border border-brand-border bg-brand-surface/60 p-4 text-sm text-slate-600">
            Delete actions support an archive-first workflow. Use <span className="font-semibold text-slate-900">Export & delete</span> when the lab wants a JSON copy of a user's account details and recent operational footprint before removal.
          </div>
        </Card>
      </div>

      <Card className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">User directory</h3>
          <p className="text-sm text-slate-500">Supervisors can adjust roles, statuses, departments, and remove accounts from here.</p>
        </div>
        {usersQuery.data.users.length === 0 ? (
          <EmptyState title="No users found" message="Created accounts will appear here." />
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
                <div key={user.id} className="rounded-xl border border-brand-border p-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-500 break-all">
                          {user.email} / created {formatDate(user.createdAt)} / last login {user.lastLogin ? formatDate(user.lastLogin) : "Not signed in yet"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-blue-100 text-brand-blue">{user.role.replaceAll("_", " ")}</Badge>
                        <Badge className="bg-slate-100 text-slate-700">{user.status}</Badge>
                      </div>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-3">
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
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
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
                        {updateUser.isPending && savingUserId === user.id ? "Saving..." : "Save changes"}
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
                      <Button
                        variant="secondary"
                        disabled={deleteUser.isPending}
                        onClick={async () => {
                          if (!window.confirm(`Export and delete ${user.name}'s account?`)) {
                            return;
                          }

                          setDeletingUserId(user.id);
                          const result = await deleteUser.mutateAsync({ userId: user.id, preserveData: true });
                          downloadArchive(user, result);
                        }}
                      >
                        {deletingUserId === user.id && deleteUser.isPending ? "Removing..." : "Export & delete"}
                      </Button>
                      <Button
                        variant="danger"
                        disabled={deleteUser.isPending}
                        onClick={async () => {
                          if (!window.confirm(`Delete ${user.name}'s account without downloading an archive?`)) {
                            return;
                          }

                          setDeletingUserId(user.id);
                          await deleteUser.mutateAsync({ userId: user.id, preserveData: false });
                        }}
                      >
                        {deletingUserId === user.id && deleteUser.isPending ? "Deleting..." : "Delete only"}
                      </Button>
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
