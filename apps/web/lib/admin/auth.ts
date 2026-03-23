import { type NextRequest } from "next/server";

import { createSignedSessionToken, verifySignedSessionToken } from "@/lib/security/session-token";

export type AdminRole = "SUPER_ADMIN" | "CONTENT_EDITOR" | "SALES_MANAGER";

export type AdminPermission =
  | "cms.pages.read"
  | "cms.pages.write"
  | "cms.pages.publish"
  | "cms.media.read"
  | "cms.media.write"
  | "cms.recipes.read"
  | "cms.recipes.write"
  | "cms.catalog.read"
  | "cms.catalog.write"
  | "orders.read"
  | "orders.write";

export type AdminAuthSource = "session_user" | "session_role_token" | "header_role_token";

export type AdminSession = {
  role: AdminRole;
  source: AdminAuthSource;
  actorId?: string;
};

export const ADMIN_SESSION_COOKIE_NAME = "nest_admin_token";
const ADMIN_SESSION_TOKEN_TYPE = "admin";

const rolePermissions: Record<AdminRole, AdminPermission[]> = {
  SUPER_ADMIN: [
    "cms.pages.read",
    "cms.pages.write",
    "cms.pages.publish",
    "cms.media.read",
    "cms.media.write",
    "cms.recipes.read",
    "cms.recipes.write",
    "cms.catalog.read",
    "cms.catalog.write",
    "orders.read",
    "orders.write",
  ],
  CONTENT_EDITOR: [
    "cms.pages.read",
    "cms.pages.write",
    "cms.media.read",
    "cms.media.write",
    "cms.recipes.read",
    "cms.recipes.write",
    "cms.catalog.read",
    "cms.catalog.write",
  ],
  SALES_MANAGER: [
    "cms.pages.read",
    "cms.media.read",
    "cms.catalog.read",
    "cms.catalog.write",
    "orders.read",
    "orders.write",
  ],
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

export function isAdminRole(value: string): value is AdminRole {
  return value === "SUPER_ADMIN" || value === "CONTENT_EDITOR" || value === "SALES_MANAGER";
}

export function resolveAdminRoleFromAuthToken(token?: string | null): AdminRole | null {
  if (!token) {
    return null;
  }

  const tokenMap = getConfiguredTokenMap();
  return tokenMap.get(token) ?? null;
}

export function createAdminSessionToken(role: AdminRole, options?: { adminUserId?: string }) {
  const adminUserId = options?.adminUserId?.trim();
  if (adminUserId) {
    return createSignedSessionToken(
      {
        type: ADMIN_SESSION_TOKEN_TYPE,
        sub: adminUserId,
        role,
      },
      { ttlSeconds: 60 * 60 * 8 },
    );
  }

  return createSignedSessionToken(
    {
      type: ADMIN_SESSION_TOKEN_TYPE,
      sub: role,
    },
    { ttlSeconds: 60 * 60 * 8 },
  );
}

export function resolveAdminSessionFromSessionToken(token?: string | null): AdminSession | null {
  if (!token) {
    return null;
  }
  const payload = verifySignedSessionToken(token, ADMIN_SESSION_TOKEN_TYPE);
  if (!payload) {
    return null;
  }

  if (typeof payload.role === "string" && isAdminRole(payload.role)) {
    const actorId = payload.sub.trim();
    return {
      role: payload.role,
      source: "session_user",
      actorId: actorId && !isAdminRole(actorId) ? actorId : undefined,
    };
  }

  const roleFromSubject = payload.sub;
  if (!isAdminRole(roleFromSubject)) {
    return null;
  }

  return {
    role: roleFromSubject,
    source: "session_role_token",
  };
}

export function resolveAdminSessionFromToken(token?: string | null): AdminSession | null {
  const fromSession = resolveAdminSessionFromSessionToken(token);
  if (fromSession) {
    return fromSession;
  }

  const roleFromHeaderToken = resolveAdminRoleFromAuthToken(token);
  if (!roleFromHeaderToken) {
    return null;
  }

  return {
    role: roleFromHeaderToken,
    source: "header_role_token",
  };
}

export function resolveAdminRoleFromToken(token?: string | null): AdminRole | null {
  return resolveAdminSessionFromToken(token)?.role ?? null;
}

export function resolveAdminSessionFromRequest(request: NextRequest): AdminSession | null {
  const tokenFromCookie = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const tokenFromHeader = request.headers.get("x-admin-token");
  return resolveAdminSessionFromToken(tokenFromHeader ?? tokenFromCookie);
}

export function resolveAdminRoleFromRequest(request: NextRequest): AdminRole | null {
  return resolveAdminSessionFromRequest(request)?.role ?? null;
}

export function hasAdminPermission(role: AdminRole, permission: AdminPermission) {
  return rolePermissions[role].includes(permission);
}

export function getAdminPermissions(role: AdminRole) {
  return rolePermissions[role];
}
