import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import { type AdminRole } from "@/lib/admin/auth";

import { readAdminDirectoryData, writeAdminDirectoryData } from "./store";
import { type AdminAccessToken, type PublicAdminAccessToken } from "./types";

const ADMIN_ROLE_OPTIONS: AdminRole[] = ["SUPER_ADMIN", "CONTENT_EDITOR", "SALES_MANAGER"];
const MIN_ACCESS_TOKEN_LENGTH = 20;

function hashAccessToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function verifyTokenHash(token: string, encodedHash: string) {
  const derivedHash = hashAccessToken(token);
  const derivedBuffer = Buffer.from(derivedHash, "hex");
  const expectedBuffer = Buffer.from(encodedHash, "hex");
  if (derivedBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return timingSafeEqual(derivedBuffer, expectedBuffer);
}

function safeTokenEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function getEnvironmentToken(role: AdminRole) {
  if (role === "SUPER_ADMIN") {
    return process.env.ADMIN_TOKEN_SUPER_ADMIN ?? process.env.ADMIN_API_TOKEN ?? "";
  }
  if (role === "CONTENT_EDITOR") {
    return process.env.ADMIN_TOKEN_CONTENT_EDITOR ?? "";
  }
  return process.env.ADMIN_TOKEN_SALES_MANAGER ?? "";
}

function isAdminRole(value: string): value is AdminRole {
  return ADMIN_ROLE_OPTIONS.includes(value as AdminRole);
}

function assertValidAccessToken(token: string) {
  const normalizedToken = token.trim();
  if (normalizedToken.length < MIN_ACCESS_TOKEN_LENGTH) {
    throw new Error(`Access token must be at least ${MIN_ACCESS_TOKEN_LENGTH} characters.`);
  }
  return normalizedToken;
}

function toPublicAccessToken(token: AdminAccessToken): PublicAdminAccessToken {
  return {
    role: token.role,
    configured: true,
    source: "managed",
    updatedAt: token.updatedAt,
    updatedByUserId: token.updatedByUserId,
    updatedByRole: token.updatedByRole,
  };
}

export function generateAdminAccessToken() {
  return `nfl-access-${randomBytes(24).toString("hex")}`;
}

export async function listAdminAccessTokenSummary(): Promise<PublicAdminAccessToken[]> {
  const data = await readAdminDirectoryData();

  return ADMIN_ROLE_OPTIONS.map((role) => {
    const managed = data.accessTokens.find((entry) => entry.role === role);
    if (managed) {
      return toPublicAccessToken(managed);
    }

    const hasEnvironmentToken = Boolean(getEnvironmentToken(role));
    return {
      role,
      configured: hasEnvironmentToken,
      source: hasEnvironmentToken ? "environment" : "none",
      updatedAt: "",
      updatedByUserId: undefined,
      updatedByRole: undefined,
    };
  });
}

export async function resolveAdminRoleFromAccessToken(
  token?: string | null,
): Promise<AdminRole | null> {
  const normalizedToken = token?.trim();
  if (!normalizedToken) {
    return null;
  }

  const data = await readAdminDirectoryData();
  for (const managed of data.accessTokens) {
    if (verifyTokenHash(normalizedToken, managed.tokenHash)) {
      return managed.role;
    }
  }

  for (const role of ADMIN_ROLE_OPTIONS) {
    const environmentToken = getEnvironmentToken(role);
    if (environmentToken && safeTokenEquals(normalizedToken, environmentToken)) {
      return role;
    }
  }

  return null;
}

export async function rotateAdminAccessToken(input: {
  role: AdminRole;
  token: string;
  updatedByUserId?: string;
  updatedByRole?: AdminRole;
}) {
  if (!isAdminRole(input.role)) {
    throw new Error("Invalid admin role.");
  }

  const token = assertValidAccessToken(input.token);
  const data = await readAdminDirectoryData();
  const nowIso = new Date().toISOString();
  const nextAccessToken: AdminAccessToken = {
    role: input.role,
    tokenHash: hashAccessToken(token),
    updatedAt: nowIso,
    updatedByUserId: input.updatedByUserId?.trim() || undefined,
    updatedByRole: input.updatedByRole,
  };

  const existingIndex = data.accessTokens.findIndex((entry) => entry.role === input.role);
  if (existingIndex >= 0) {
    data.accessTokens[existingIndex] = nextAccessToken;
  } else {
    data.accessTokens.push(nextAccessToken);
  }

  await writeAdminDirectoryData(data);
  return toPublicAccessToken(nextAccessToken);
}
