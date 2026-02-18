import { type NextRequest } from "next/server";

import { createSignedSessionToken, verifySignedSessionToken } from "@/lib/security/session-token";

export type AdminRole = "SUPER_ADMIN" | "CONTENT_EDITOR" | "SALES_MANAGER";

export type AdminPermission =
  | "cms.pages.read"
  | "cms.pages.write"
  | "cms.pages.publish"
  | "cms.catalog.read"
  | "cms.catalog.write"
  | "orders.read";

export const ADMIN_SESSION_COOKIE_NAME = "nest_admin_token";
const ADMIN_SESSION_TOKEN_TYPE = "admin";

const rolePermissions: Record<AdminRole, AdminPermission[]> = {
  SUPER_ADMIN: [
    "cms.pages.read",
    "cms.pages.write",
    "cms.pages.publish",
    "cms.catalog.read",
    "cms.catalog.write",
    "orders.read",
  ],
  CONTENT_EDITOR: ["cms.pages.read", "cms.pages.write", "cms.catalog.read"],
  SALES_MANAGER: ["cms.pages.read", "cms.catalog.read", "orders.read"],
};

function getConfiguredTokenMap() {
  const mapping = new Map<string, AdminRole>();

  const superAdminToken = process.env.ADMIN_TOKEN_SUPER_ADMIN ?? process.env.ADMIN_API_TOKEN;
  if (superAdminToken) {
    mapping.set(superAdminToken, "SUPER_ADMIN");
  }

  if (process.env.ADMIN_TOKEN_CONTENT_EDITOR) {
    mapping.set(process.env.ADMIN_TOKEN_CONTENT_EDITOR, "CONTENT_EDITOR");
  }

  if (process.env.ADMIN_TOKEN_SALES_MANAGER) {
    mapping.set(process.env.ADMIN_TOKEN_SALES_MANAGER, "SALES_MANAGER");
  }

  return mapping;
}

function isAdminRole(value: string): value is AdminRole {
  return value === "SUPER_ADMIN" || value === "CONTENT_EDITOR" || value === "SALES_MANAGER";
}

export function resolveAdminRoleFromAuthToken(token?: string | null): AdminRole | null {
  if (!token) {
    return null;
  }

  const tokenMap = getConfiguredTokenMap();
  return tokenMap.get(token) ?? null;
}

export function createAdminSessionToken(role: AdminRole) {
  return createSignedSessionToken(
    {
      type: ADMIN_SESSION_TOKEN_TYPE,
      sub: role,
      role,
    },
    { ttlSeconds: 60 * 60 * 8 },
  );
}

function resolveAdminRoleFromSessionToken(token?: string | null): AdminRole | null {
  if (!token) {
    return null;
  }
  const payload = verifySignedSessionToken(token, ADMIN_SESSION_TOKEN_TYPE);
  if (!payload) {
    return null;
  }

  const roleFromPayload = typeof payload.role === "string" ? payload.role : payload.sub;
  if (!isAdminRole(roleFromPayload)) {
    return null;
  }
  return roleFromPayload;
}

export function resolveAdminRoleFromToken(token?: string | null): AdminRole | null {
  return resolveAdminRoleFromSessionToken(token) ?? resolveAdminRoleFromAuthToken(token);
}

export function resolveAdminRoleFromRequest(request: NextRequest): AdminRole | null {
  const tokenFromCookie = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const tokenFromHeader = request.headers.get("x-admin-token");
  return resolveAdminRoleFromToken(tokenFromHeader ?? tokenFromCookie);
}

export function hasAdminPermission(role: AdminRole, permission: AdminPermission) {
  return rolePermissions[role].includes(permission);
}

export function getAdminPermissions(role: AdminRole) {
  return rolePermissions[role];
}
