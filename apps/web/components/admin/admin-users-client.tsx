"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type AdminRole } from "@/lib/admin/auth";
import { type PublicAdminInvite, type PublicAdminUser } from "@/lib/admin/types";

type AdminDirectoryResponse = {
  role: string;
  actorId?: string;
  users: PublicAdminUser[];
  invites: PublicAdminInvite[];
};

type CreateInviteResponse = {
  role: string;
  invite: PublicAdminInvite;
  inviteToken: string;
};

type UpdateUserResponse = {
  role: string;
  user: PublicAdminUser;
};

type RevokeInviteResponse = {
  role: string;
  invite: PublicAdminInvite;
};

type InviteFormState = {
  email: string;
  role: AdminRole;
  mfaRequired: boolean;
  expiresInHours: string;
};

type UserUpdateFormState = {
  role: AdminRole;
  status: "active" | "suspended";
  mfaRequired: boolean;
  newMfaCode: string;
};

const roleOptions: AdminRole[] = ["SUPER_ADMIN", "CONTENT_EDITOR", "SALES_MANAGER"];

const emptyInviteForm: InviteFormState = {
  email: "",
  role: "CONTENT_EDITOR",
  mfaRequired: false,
  expiresInHours: "72",
};

function toUserUpdateForm(user: PublicAdminUser): UserUpdateFormState {
  return {
    role: user.role,
    status: user.status,
    mfaRequired: user.mfaRequired,
    newMfaCode: "",
  };
}

function formatDate(value?: string) {
  if (!value) {
    return "N/A";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }
  return date.toLocaleString("en-NG");
}

export function AdminUsersClient() {
  const [role, setRole] = useState("Unknown");
  const [users, setUsers] = useState<PublicAdminUser[]>([]);
  const [invites, setInvites] = useState<PublicAdminInvite[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [inviteForm, setInviteForm] = useState<InviteFormState>(emptyInviteForm);
  const [userForm, setUserForm] = useState<UserUpdateFormState | null>(null);
  const [lastInviteToken, setLastInviteToken] = useState("");
  const [savingInvite, setSavingInvite] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [status, setStatus] = useState("Loading admin directory...");

  const selectedUser = useMemo(
    () => users.find((entry) => entry.id === selectedUserId) ?? null,
    [users, selectedUserId],
  );
  const canManage = role === "SUPER_ADMIN";

  const reloadDirectory = useCallback(async (preferredUserId?: string) => {
    const response = await fetch("/api/admin/users", { cache: "no-store" });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to load admin users.");
      return;
    }

    const data = (await response.json()) as AdminDirectoryResponse;
    setRole(data.role);
    setUsers(data.users);
    setInvites(data.invites);

    const target = preferredUserId
      ? (data.users.find((entry) => entry.id === preferredUserId) ?? data.users[0] ?? null)
      : (data.users[0] ?? null);
    setSelectedUserId(target ? target.id : "");
    setUserForm(target ? toUserUpdateForm(target) : null);
    setStatus("Admin user directory ready.");
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void reloadDirectory();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [reloadDirectory]);

  function updateInviteForm(partial: Partial<InviteFormState>) {
    setInviteForm((current) => {
      const next = { ...current, ...partial };
      if (next.role === "SUPER_ADMIN") {
        next.mfaRequired = true;
      }
      return next;
    });
  }

  async function createInvite() {
    if (!canManage) {
      setStatus("This role has read-only access.");
      return;
    }

    setSavingInvite(true);
    setStatus("Creating admin invite...");
    const response = await fetch("/api/admin/users/invites", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: inviteForm.email.trim(),
        role: inviteForm.role,
        mfaRequired: inviteForm.mfaRequired,
        expiresInHours: Number(inviteForm.expiresInHours),
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to create invite.");
      setSavingInvite(false);
      return;
    }

    const data = (await response.json()) as CreateInviteResponse;
    setLastInviteToken(data.inviteToken);
    setInviteForm({
      ...emptyInviteForm,
      role: inviteForm.role,
      mfaRequired: inviteForm.role === "SUPER_ADMIN",
    });
    await reloadDirectory(selectedUserId || undefined);
    setStatus(`Created invite for ${data.invite.email}.`);
    setSavingInvite(false);
  }

  async function revokeInvite(inviteId: string) {
    if (!canManage) {
      setStatus("This role has read-only access.");
      return;
    }
    if (!window.confirm("Revoke this invite?")) {
      return;
    }

    const response = await fetch(`/api/admin/users/invites/${inviteId}`, { method: "DELETE" });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to revoke invite.");
      return;
    }

    const data = (await response.json()) as RevokeInviteResponse;
    await reloadDirectory(selectedUserId || undefined);
    setStatus(`Invite ${data.invite.email} is now ${data.invite.status}.`);
  }

  async function saveUser() {
    if (!selectedUser || !userForm) {
      setStatus("Select an admin user first.");
      return;
    }
    if (!canManage) {
      setStatus("This role has read-only access.");
      return;
    }

    setSavingUser(true);
    setStatus("Saving user changes...");

    const payload: Record<string, string | boolean> = {
      role: userForm.role,
      status: userForm.status,
      mfaRequired: userForm.mfaRequired,
    };
    if (userForm.newMfaCode.trim()) {
      payload.newMfaCode = userForm.newMfaCode.trim();
    }

    const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to update user.");
      setSavingUser(false);
      return;
    }

    const data = (await response.json()) as UpdateUserResponse;
    await reloadDirectory(data.user.id);
    setStatus(`Updated ${data.user.email}.`);
    setSavingUser(false);
  }

  async function resetUserLock() {
    if (!selectedUser) {
      setStatus("Select an admin user first.");
      return;
    }
    if (!canManage) {
      setStatus("This role has read-only access.");
      return;
    }

    const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ resetFailedLogins: true }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to reset lock state.");
      return;
    }

    await reloadDirectory(selectedUser.id);
    setStatus(`Reset lock state for ${selectedUser.email}.`);
  }

  async function copyInviteToken() {
    if (!lastInviteToken) {
      return;
    }
    try {
      await navigator.clipboard.writeText(lastInviteToken);
      setStatus("Invite token copied.");
    } catch {
      setStatus("Unable to copy invite token.");
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
      <div className="space-y-2">
        <Badge>Admin Access</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          Admin User Directory
        </h1>
        <p className="text-sm text-neutral-600">
          Role: <span className="font-semibold">{role}</span>. Invite users, map roles, and enforce
          MFA policy.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Create Invite
          </p>
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Email
            </span>
            <Input
              value={inviteForm.email}
              onChange={(event) => updateInviteForm({ email: event.target.value })}
              placeholder="admin@nestfoodsltd.com"
              type="email"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                Role
              </span>
              <select
                value={inviteForm.role}
                onChange={(event) => updateInviteForm({ role: event.target.value as AdminRole })}
                className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900"
              >
                {roleOptions.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                Expires (hours)
              </span>
              <Input
                value={inviteForm.expiresInHours}
                onChange={(event) => updateInviteForm({ expiresInHours: event.target.value })}
                type="number"
                min={1}
                max={336}
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={inviteForm.mfaRequired}
              onChange={(event) => updateInviteForm({ mfaRequired: event.target.checked })}
              disabled={inviteForm.role === "SUPER_ADMIN"}
              className="h-4 w-4 rounded border-neutral-400"
            />
            Require MFA for this invite
          </label>

          <Button
            onClick={() => void createInvite()}
            disabled={
              savingInvite ||
              !canManage ||
              !inviteForm.email.includes("@") ||
              Number(inviteForm.expiresInHours) < 1
            }
          >
            {savingInvite ? "Creating..." : "Create Invite"}
          </Button>

          {lastInviteToken ? (
            <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">
                One-time Invite Token
              </p>
              <p className="break-all text-xs text-amber-800">
                {lastInviteToken}
              </p>
              <Button size="sm" variant="secondary" onClick={() => void copyInviteToken()}>
                Copy Token
              </Button>
            </div>
          ) : null}

          <div className="space-y-2 rounded-xl border border-neutral-200 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Pending Invites
            </p>
            {invites.length === 0 ? (
              <p className="text-xs text-neutral-500">No invites yet.</p>
            ) : (
              invites.slice(0, 8).map((invite) => (
                <div
                  key={invite.id}
                  className="rounded-lg border border-neutral-200 p-2 text-xs text-neutral-600"
                >
                  <p className="font-medium">{invite.email}</p>
                  <p>
                    {invite.role} · {invite.status} · expires {formatDate(invite.expiresAt)}
                  </p>
                  {invite.status === "pending" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-1"
                      disabled={!canManage}
                      onClick={() => void revokeInvite(invite.id)}
                    >
                      Revoke
                    </Button>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Admin Users
          </p>
          <select
            value={selectedUserId}
            onChange={(event) => {
              const nextId = event.target.value;
              setSelectedUserId(nextId);
              const target = users.find((entry) => entry.id === nextId) ?? null;
              setUserForm(target ? toUserUpdateForm(target) : null);
            }}
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900"
          >
            <option value="">Select admin user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email} · {user.role} · {user.status}
              </option>
            ))}
          </select>

          {selectedUser && userForm ? (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                    Full Name
                  </span>
                  <Input value={selectedUser.fullName} disabled />
                </label>
                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                    Email
                  </span>
                  <Input value={selectedUser.email} disabled />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                    Role
                  </span>
                  <select
                    value={userForm.role}
                    onChange={(event) =>
                      setUserForm((current) =>
                        current
                          ? {
                              ...current,
                              role: event.target.value as AdminRole,
                              mfaRequired:
                                event.target.value === "SUPER_ADMIN" ? true : current.mfaRequired,
                            }
                          : current,
                      )
                    }
                    className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900"
                  >
                    {roleOptions.map((entry) => (
                      <option key={entry} value={entry}>
                        {entry}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                    Status
                  </span>
                  <select
                    value={userForm.status}
                    onChange={(event) =>
                      setUserForm((current) =>
                        current
                          ? {
                              ...current,
                              status: event.target.value as "active" | "suspended",
                            }
                          : current,
                      )
                    }
                    className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900"
                  >
                    <option value="active">active</option>
                    <option value="suspended">suspended</option>
                  </select>
                </label>
                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                    New MFA Code
                  </span>
                  <Input
                    value={userForm.newMfaCode}
                    onChange={(event) =>
                      setUserForm((current) =>
                        current
                          ? {
                              ...current,
                              newMfaCode: event.target.value,
                            }
                          : current,
                      )
                    }
                    placeholder="6 digits"
                    maxLength={6}
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 text-sm text-neutral-600">
                <input
                  type="checkbox"
                  checked={userForm.mfaRequired}
                  disabled={userForm.role === "SUPER_ADMIN"}
                  onChange={(event) =>
                    setUserForm((current) =>
                      current
                        ? {
                            ...current,
                            mfaRequired: event.target.checked,
                          }
                        : current,
                    )
                  }
                  className="h-4 w-4 rounded border-neutral-400"
                />
                MFA required ({selectedUser.hasMfaSecret ? "configured" : "not configured"})
              </label>

              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <Button onClick={() => void saveUser()} disabled={savingUser || !canManage}>
                  {savingUser ? "Saving..." : "Save User"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => void resetUserLock()}
                  disabled={!canManage}
                >
                  Reset Lock State
                </Button>
              </div>

              <div className="rounded-xl border border-neutral-200 p-3 text-xs text-neutral-600">
                <p>Created: {formatDate(selectedUser.createdAt)}</p>
                <p>Updated: {formatDate(selectedUser.updatedAt)}</p>
                <p>Last login: {formatDate(selectedUser.lastLoginAt)}</p>
                <p>Failed logins: {selectedUser.failedLoginCount}</p>
                <p>Locked until: {formatDate(selectedUser.lockedUntil)}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-neutral-500">
              Select a user to manage.
            </p>
          )}
        </Card>
      </div>

      <p className="text-xs text-neutral-500">{status}</p>
    </section>
  );
}
