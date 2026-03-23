import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { readPostgresJsonStore, writePostgresJsonStore } from "@/lib/storage/postgres-json";
import { resolveJsonDataFilePath } from "@/lib/storage/json-file";

import { ADMIN_DIRECTORY_SEED_DATA } from "./seed";
import {
  type AdminDirectoryData,
  type AdminInvite,
  type AdminInviteStatus,
  type AdminUser,
  type AdminUserStatus,
} from "./types";
import { type AdminRole, isAdminRole } from "./auth";

const relativeDataFilePath = path.join("data", "admin-users.json");

const dataFilePath = resolveJsonDataFilePath(relativeDataFilePath);
const storageDriver = process.env.ADMIN_USERS_STORAGE_DRIVER ?? "json";
const postgresModuleKey = "admin_users";

function normalizeIsoString(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }
  return date.toISOString();
}

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().toLowerCase();
}

function normalizeStatus(value: unknown): AdminUserStatus {
  return value === "suspended" ? "suspended" : "active";
}

function normalizeInviteStatus(value: unknown): AdminInviteStatus {
  if (value === "accepted" || value === "revoked" || value === "expired") {
    return value;
  }
  return "pending";
}

function normalizeRole(value: unknown): AdminRole | null {
  if (typeof value !== "string") {
    return null;
  }
  return isAdminRole(value) ? value : null;
}

function normalizeAdminUser(input: Partial<AdminUser> | null | undefined): AdminUser | null {
  if (!input) {
    return null;
  }

  const role = normalizeRole(input.role);
  const email = normalizeEmail(input.email);
  if (!input.id?.trim() || !role || !email || !input.passwordHash?.trim()) {
    return null;
  }

  const now = new Date().toISOString();
  const failedLoginCountInput =
    typeof input.failedLoginCount === "number" ? input.failedLoginCount : Number.NaN;
  return {
    id: input.id.trim(),
    email,
    fullName: input.fullName?.trim() || "Admin User",
    role,
    status: normalizeStatus(input.status),
    passwordHash: input.passwordHash.trim(),
    mfaRequired: Boolean(input.mfaRequired),
    mfaSecretHash: input.mfaSecretHash?.trim() || undefined,
    invitedByUserId: input.invitedByUserId?.trim() || undefined,
    invitedByRole: normalizeRole(input.invitedByRole) ?? undefined,
    createdAt: normalizeIsoString(input.createdAt, now),
    updatedAt: normalizeIsoString(input.updatedAt, now),
    lastLoginAt: input.lastLoginAt ? normalizeIsoString(input.lastLoginAt, now) : undefined,
    failedLoginCount: Number.isFinite(failedLoginCountInput)
      ? Math.max(0, failedLoginCountInput)
      : 0,
    lockedUntil: input.lockedUntil ? normalizeIsoString(input.lockedUntil, now) : undefined,
  };
}

function normalizeAdminInvite(input: Partial<AdminInvite> | null | undefined): AdminInvite | null {
  if (!input) {
    return null;
  }

  const role = normalizeRole(input.role);
  const email = normalizeEmail(input.email);
  if (!input.id?.trim() || !role || !email || !input.tokenHash?.trim()) {
    return null;
  }

  const now = new Date().toISOString();
  return {
    id: input.id.trim(),
    email,
    role,
    status: normalizeInviteStatus(input.status),
    tokenHash: input.tokenHash.trim(),
    mfaRequired: Boolean(input.mfaRequired),
    invitedByUserId: input.invitedByUserId?.trim() || undefined,
    invitedByRole: normalizeRole(input.invitedByRole) ?? undefined,
    createdAt: normalizeIsoString(input.createdAt, now),
    updatedAt: normalizeIsoString(input.updatedAt, now),
    expiresAt: normalizeIsoString(input.expiresAt, now),
    acceptedAt: input.acceptedAt ? normalizeIsoString(input.acceptedAt, now) : undefined,
  };
}

function mergeAdminDirectoryData(
  input: Partial<AdminDirectoryData> | null | undefined,
): AdminDirectoryData {
  if (!input) {
    return structuredClone(ADMIN_DIRECTORY_SEED_DATA);
  }

  const users = (input.users ?? [])
    .map((entry) => normalizeAdminUser(entry))
    .filter((entry): entry is AdminUser => Boolean(entry));
  const userIdSet = new Set(users.map((entry) => entry.id));
  const invites = (input.invites ?? [])
    .map((entry) => normalizeAdminInvite(entry))
    .filter((entry): entry is AdminInvite => Boolean(entry))
    .map((entry) => {
      if (entry.invitedByUserId && !userIdSet.has(entry.invitedByUserId)) {
        return { ...entry, invitedByUserId: undefined };
      }
      return entry;
    });

  return {
    users,
    invites,
  };
}

export async function readAdminDirectoryData(): Promise<AdminDirectoryData> {
  if (storageDriver === "postgres") {
    const payload = await readPostgresJsonStore<Partial<AdminDirectoryData>>(
      postgresModuleKey,
      ADMIN_DIRECTORY_SEED_DATA,
    );
    return mergeAdminDirectoryData(payload);
  }

  if (storageDriver !== "json") {
    throw new Error(
      "ADMIN_USERS_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.",
    );
  }

  try {
    const raw = await readFile(dataFilePath, "utf8");
    return mergeAdminDirectoryData(JSON.parse(raw) as Partial<AdminDirectoryData>);
  } catch {
    await writeAdminDirectoryData(ADMIN_DIRECTORY_SEED_DATA);
    return ADMIN_DIRECTORY_SEED_DATA;
  }
}

export async function writeAdminDirectoryData(data: AdminDirectoryData) {
  if (storageDriver === "postgres") {
    await writePostgresJsonStore(postgresModuleKey, data);
    return;
  }

  if (storageDriver !== "json") {
    throw new Error(
      "ADMIN_USERS_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.",
    );
  }

  await mkdir(path.dirname(dataFilePath), { recursive: true });
  await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}
