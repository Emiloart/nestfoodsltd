import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import { unstable_noStore as noStore } from "next/cache";

import { type AdminRole } from "@/lib/admin/auth";

import { readAdminDirectoryData, writeAdminDirectoryData } from "./store";
import {
  type AdminInvite,
  type AdminInviteStatus,
  type AdminUser,
  type AdminUserStatus,
  type PublicAdminInvite,
  type PublicAdminUser,
} from "./types";

const SECRET_HASH_VERSION = "s1";
const DEFAULT_INVITE_TTL_HOURS = 72;
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

type AuthFailureReason =
  | "invalid_credentials"
  | "mfa_required"
  | "mfa_invalid"
  | "mfa_not_configured"
  | "account_suspended"
  | "account_locked";

export type CreateAdminInviteInput = {
  email: string;
  role: AdminRole;
  invitedByRole?: AdminRole;
  invitedByUserId?: string;
  mfaRequired?: boolean;
  expiresInHours?: number;
};

export type ActivateAdminInviteInput = {
  inviteToken: string;
  fullName: string;
  password: string;
  mfaCode?: string;
};

export type AuthenticateAdminDirectoryUserInput = {
  email: string;
  password: string;
  mfaCode?: string;
};

export type AuthenticateAdminDirectoryUserResult =
  | {
      authenticated: true;
      user: {
        id: string;
        email: string;
        role: AdminRole;
        fullName: string;
      };
    }
  | {
      authenticated: false;
      reason: AuthFailureReason;
      retryAfterSeconds?: number;
    };

export type UpdateAdminUserInput = {
  userId: string;
  role?: AdminRole;
  status?: AdminUserStatus;
  mfaRequired?: boolean;
  newMfaCode?: string;
  resetFailedLogins?: boolean;
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizeMfaCode(value?: string) {
  if (!value) {
    return "";
  }
  return value.replace(/\s+/g, "").trim();
}

function ensureStrongPassword(value: string) {
  const password = value.trim();
  if (password.length < 12) {
    throw new Error("Password must be at least 12 characters.");
  }
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  if (!hasUppercase || !hasLowercase || !hasDigit) {
    throw new Error("Password must include uppercase, lowercase, and a number.");
  }
  return password;
}

function ensureMfaCode(value?: string) {
  const mfaCode = normalizeMfaCode(value);
  if (!/^\d{6}$/.test(mfaCode)) {
    throw new Error("MFA code must be a 6-digit value.");
  }
  return mfaCode;
}

function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function hashSecret(secret: string) {
  const salt = randomBytes(16).toString("hex");
  const output = scryptSync(secret, salt, 64).toString("hex");
  return `${SECRET_HASH_VERSION}$${salt}$${output}`;
}

function verifySecret(secret: string, encodedHash?: string) {
  if (!encodedHash) {
    return false;
  }

  const [version, salt, expectedHex] = encodedHash.split("$");
  if (!version || !salt || !expectedHex || version !== SECRET_HASH_VERSION) {
    return false;
  }

  const derivedHex = scryptSync(secret, salt, expectedHex.length / 2).toString("hex");
  const expectedBuffer = Buffer.from(expectedHex, "hex");
  const derivedBuffer = Buffer.from(derivedHex, "hex");
  if (expectedBuffer.length !== derivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, derivedBuffer);
}

function resolveInviteTtlHours(input?: number) {
  if (Number.isFinite(input) && Number(input) > 0) {
    return Math.min(Math.round(Number(input)), 24 * 14);
  }

  const configured = Number(process.env.ADMIN_INVITE_TTL_HOURS);
  if (Number.isFinite(configured) && configured > 0) {
    return Math.min(Math.round(configured), 24 * 14);
  }

  return DEFAULT_INVITE_TTL_HOURS;
}

function toPublicAdminUser(user: AdminUser): PublicAdminUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    status: user.status,
    mfaRequired: user.mfaRequired,
    hasMfaSecret: Boolean(user.mfaSecretHash),
    invitedByUserId: user.invitedByUserId,
    invitedByRole: user.invitedByRole,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
    failedLoginCount: user.failedLoginCount,
    lockedUntil: user.lockedUntil,
  };
}

function toPublicAdminInvite(invite: AdminInvite): PublicAdminInvite {
  return {
    id: invite.id,
    email: invite.email,
    role: invite.role,
    status: invite.status,
    mfaRequired: invite.mfaRequired,
    invitedByUserId: invite.invitedByUserId,
    invitedByRole: invite.invitedByRole,
    createdAt: invite.createdAt,
    updatedAt: invite.updatedAt,
    expiresAt: invite.expiresAt,
    acceptedAt: invite.acceptedAt,
  };
}

function compareIsoDateDescending(a: string, b: string) {
  return new Date(b).getTime() - new Date(a).getTime();
}

function markExpiredInvites(invites: AdminInvite[], nowIso: string) {
  let updated = false;
  for (const invite of invites) {
    if (invite.status !== "pending") {
      continue;
    }
    if (new Date(invite.expiresAt).getTime() <= new Date(nowIso).getTime()) {
      invite.status = "expired";
      invite.updatedAt = nowIso;
      updated = true;
    }
  }
  return updated;
}

function findUserByEmail(users: AdminUser[], email: string) {
  return users.find((entry) => entry.email === email) ?? null;
}

function resolveRetryAfterSeconds(lockedUntil?: string) {
  if (!lockedUntil) {
    return undefined;
  }
  const remainingMs = new Date(lockedUntil).getTime() - Date.now();
  if (remainingMs <= 0) {
    return undefined;
  }
  return Math.ceil(remainingMs / 1000);
}

function incrementFailedLoginCounter(user: AdminUser, nowIso: string) {
  user.failedLoginCount += 1;
  if (user.failedLoginCount >= MAX_FAILED_LOGIN_ATTEMPTS) {
    const lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString();
    user.lockedUntil = lockedUntil;
  }
  user.updatedAt = nowIso;
}

function clearLoginFailureState(user: AdminUser, nowIso: string) {
  user.failedLoginCount = 0;
  user.lockedUntil = undefined;
  user.lastLoginAt = nowIso;
  user.updatedAt = nowIso;
}

function resolveInviteStatusAfterRevoke(status: AdminInviteStatus): AdminInviteStatus {
  if (status === "pending") {
    return "revoked";
  }
  return status;
}

export async function listAdminUsers() {
  noStore();
  const data = await readAdminDirectoryData();
  const nowIso = new Date().toISOString();
  const changed = markExpiredInvites(data.invites, nowIso);
  if (changed) {
    await writeAdminDirectoryData(data);
  }

  return [...data.users]
    .sort((a, b) => compareIsoDateDescending(a.createdAt, b.createdAt))
    .map((entry) => toPublicAdminUser(entry));
}

export async function listAdminInvites() {
  noStore();
  const data = await readAdminDirectoryData();
  const nowIso = new Date().toISOString();
  const changed = markExpiredInvites(data.invites, nowIso);
  if (changed) {
    await writeAdminDirectoryData(data);
  }

  return [...data.invites]
    .sort((a, b) => compareIsoDateDescending(a.createdAt, b.createdAt))
    .map((entry) => toPublicAdminInvite(entry));
}

export async function listAdminDirectorySummary() {
  const [users, invites] = await Promise.all([listAdminUsers(), listAdminInvites()]);
  return { users, invites };
}

export async function createAdminInvite(input: CreateAdminInviteInput) {
  const email = normalizeEmail(input.email);
  if (!email || !email.includes("@")) {
    throw new Error("Valid invite email is required.");
  }

  const data = await readAdminDirectoryData();
  const nowIso = new Date().toISOString();
  markExpiredInvites(data.invites, nowIso);

  const existingUser = findUserByEmail(data.users, email);
  if (existingUser && existingUser.status === "active") {
    throw new Error("An active admin user already exists for this email.");
  }

  for (const invite of data.invites) {
    if (invite.email !== email) {
      continue;
    }
    const nextStatus = resolveInviteStatusAfterRevoke(invite.status);
    if (nextStatus !== invite.status) {
      invite.status = nextStatus;
      invite.updatedAt = nowIso;
    }
  }

  const inviteToken = `nfl-admin-${crypto.randomUUID()}-${randomBytes(4).toString("hex")}`;
  const invite: AdminInvite = {
    id: `adm-invite-${crypto.randomUUID()}`,
    email,
    role: input.role,
    status: "pending",
    tokenHash: hashInviteToken(inviteToken),
    mfaRequired: input.mfaRequired ?? input.role === "SUPER_ADMIN",
    invitedByUserId: input.invitedByUserId?.trim() || undefined,
    invitedByRole: input.invitedByRole,
    createdAt: nowIso,
    updatedAt: nowIso,
    expiresAt: new Date(
      Date.now() + resolveInviteTtlHours(input.expiresInHours) * 60 * 60 * 1000,
    ).toISOString(),
  };

  data.invites.unshift(invite);
  await writeAdminDirectoryData(data);

  return {
    invite: toPublicAdminInvite(invite),
    inviteToken,
  };
}

export async function revokeAdminInvite(inviteId: string) {
  const normalizedInviteId = inviteId.trim();
  if (!normalizedInviteId) {
    throw new Error("Invite id is required.");
  }

  const data = await readAdminDirectoryData();
  const invite = data.invites.find((entry) => entry.id === normalizedInviteId);
  if (!invite) {
    throw new Error("Invite not found.");
  }

  const nowIso = new Date().toISOString();
  invite.status = resolveInviteStatusAfterRevoke(invite.status);
  invite.updatedAt = nowIso;

  await writeAdminDirectoryData(data);
  return toPublicAdminInvite(invite);
}

export async function activateAdminInvite(input: ActivateAdminInviteInput) {
  const inviteToken = input.inviteToken.trim();
  if (!inviteToken) {
    throw new Error("Invite token is required.");
  }

  const fullName = input.fullName.trim();
  if (fullName.length < 2) {
    throw new Error("Full name is required.");
  }

  const password = ensureStrongPassword(input.password);
  const data = await readAdminDirectoryData();
  const nowIso = new Date().toISOString();
  markExpiredInvites(data.invites, nowIso);

  const invite = data.invites.find(
    (entry) => entry.tokenHash === hashInviteToken(inviteToken) && entry.status === "pending",
  );
  if (!invite) {
    throw new Error("Invalid or expired invite token.");
  }

  if (new Date(invite.expiresAt).getTime() <= Date.now()) {
    invite.status = "expired";
    invite.updatedAt = nowIso;
    await writeAdminDirectoryData(data);
    throw new Error("Invite has expired.");
  }

  const existingUser = findUserByEmail(data.users, invite.email);
  if (existingUser && existingUser.status === "active") {
    throw new Error("An active admin user already exists for this email.");
  }

  const shouldRequireMfa = invite.mfaRequired || invite.role === "SUPER_ADMIN";
  const normalizedMfaCode = shouldRequireMfa
    ? ensureMfaCode(input.mfaCode)
    : normalizeMfaCode(input.mfaCode);

  const user: AdminUser = {
    id: existingUser?.id ?? `adm-user-${crypto.randomUUID()}`,
    email: invite.email,
    fullName,
    role: invite.role,
    status: "active",
    passwordHash: hashSecret(password),
    mfaRequired: shouldRequireMfa,
    mfaSecretHash: normalizedMfaCode ? hashSecret(normalizedMfaCode) : undefined,
    invitedByUserId: invite.invitedByUserId,
    invitedByRole: invite.invitedByRole,
    createdAt: existingUser?.createdAt ?? nowIso,
    updatedAt: nowIso,
    lastLoginAt: existingUser?.lastLoginAt,
    failedLoginCount: 0,
    lockedUntil: undefined,
  };

  if (existingUser) {
    const userIndex = data.users.findIndex((entry) => entry.id === existingUser.id);
    if (userIndex >= 0) {
      data.users[userIndex] = user;
    }
  } else {
    data.users.unshift(user);
  }

  invite.status = "accepted";
  invite.acceptedAt = nowIso;
  invite.updatedAt = nowIso;

  await writeAdminDirectoryData(data);

  return {
    user: toPublicAdminUser(user),
  };
}

export async function authenticateAdminDirectoryUser(
  input: AuthenticateAdminDirectoryUserInput,
): Promise<AuthenticateAdminDirectoryUserResult> {
  const email = normalizeEmail(input.email);
  const password = input.password.trim();
  const mfaCode = normalizeMfaCode(input.mfaCode);
  if (!email || !password) {
    return { authenticated: false, reason: "invalid_credentials" };
  }

  const data = await readAdminDirectoryData();
  const nowIso = new Date().toISOString();
  const changedFromExpiry = markExpiredInvites(data.invites, nowIso);
  const user = findUserByEmail(data.users, email);
  if (!user) {
    if (changedFromExpiry) {
      await writeAdminDirectoryData(data);
    }
    return { authenticated: false, reason: "invalid_credentials" };
  }

  if (user.status !== "active") {
    if (changedFromExpiry) {
      await writeAdminDirectoryData(data);
    }
    return { authenticated: false, reason: "account_suspended" };
  }

  const lockedUntilMs = user.lockedUntil ? new Date(user.lockedUntil).getTime() : 0;
  if (lockedUntilMs > Date.now()) {
    if (changedFromExpiry) {
      await writeAdminDirectoryData(data);
    }
    return {
      authenticated: false,
      reason: "account_locked",
      retryAfterSeconds: resolveRetryAfterSeconds(user.lockedUntil),
    };
  }

  const passwordMatches = verifySecret(password, user.passwordHash);
  if (!passwordMatches) {
    incrementFailedLoginCounter(user, nowIso);
    await writeAdminDirectoryData(data);
    if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
      return {
        authenticated: false,
        reason: "account_locked",
        retryAfterSeconds: resolveRetryAfterSeconds(user.lockedUntil),
      };
    }
    return { authenticated: false, reason: "invalid_credentials" };
  }

  if (user.mfaRequired) {
    if (!user.mfaSecretHash) {
      incrementFailedLoginCounter(user, nowIso);
      await writeAdminDirectoryData(data);
      return { authenticated: false, reason: "mfa_not_configured" };
    }
    if (!mfaCode) {
      return { authenticated: false, reason: "mfa_required" };
    }
    if (!verifySecret(mfaCode, user.mfaSecretHash)) {
      incrementFailedLoginCounter(user, nowIso);
      await writeAdminDirectoryData(data);
      if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
        return {
          authenticated: false,
          reason: "account_locked",
          retryAfterSeconds: resolveRetryAfterSeconds(user.lockedUntil),
        };
      }
      return { authenticated: false, reason: "mfa_invalid" };
    }
  }

  clearLoginFailureState(user, nowIso);
  await writeAdminDirectoryData(data);

  return {
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
  };
}

export async function updateAdminUser(input: UpdateAdminUserInput) {
  const userId = input.userId.trim();
  if (!userId) {
    throw new Error("User id is required.");
  }

  const data = await readAdminDirectoryData();
  const user = data.users.find((entry) => entry.id === userId);
  if (!user) {
    throw new Error("Admin user not found.");
  }

  const nowIso = new Date().toISOString();
  if (input.role) {
    user.role = input.role;
    if (user.role === "SUPER_ADMIN") {
      user.mfaRequired = true;
    }
  }

  if (input.status) {
    user.status = input.status;
    if (user.status === "suspended") {
      user.lockedUntil = undefined;
    }
  }

  if (input.mfaRequired !== undefined) {
    user.mfaRequired = input.mfaRequired;
    if (!input.mfaRequired) {
      user.mfaSecretHash = undefined;
    }
  }

  const normalizedNewMfaCode = normalizeMfaCode(input.newMfaCode);
  if (normalizedNewMfaCode) {
    user.mfaSecretHash = hashSecret(ensureMfaCode(normalizedNewMfaCode));
    user.mfaRequired = true;
  }

  if (user.mfaRequired && !user.mfaSecretHash) {
    throw new Error("MFA is required but no MFA code is configured.");
  }

  if (input.resetFailedLogins) {
    user.failedLoginCount = 0;
    user.lockedUntil = undefined;
  }

  user.updatedAt = nowIso;
  await writeAdminDirectoryData(data);
  return toPublicAdminUser(user);
}
