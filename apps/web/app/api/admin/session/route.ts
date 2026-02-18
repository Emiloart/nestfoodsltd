import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  ADMIN_SESSION_COOKIE_NAME,
  createAdminSessionToken,
  getAdminPermissions,
  resolveAdminRoleFromRequest,
  resolveAdminRoleFromAuthToken,
} from "@/lib/admin/auth";
import { logAuditEvent } from "@/lib/audit/service";
import {
  applyRateLimitHeaders,
  createRateLimitErrorResponse,
  evaluateRateLimit,
} from "@/lib/security/rate-limit";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

const loginSchema = z.object({
  token: z.string().trim().min(8),
});

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  };
}

function logAdminAuditEvent(
  request: NextRequest,
  input: {
    actorRole?: string;
    action: string;
    outcome: "success" | "failure" | "blocked";
    severity: "info" | "warning" | "critical";
    details?: Record<string, unknown>;
  },
) {
  void logAuditEvent({
    actorType: "admin",
    actorRole: input.actorRole,
    action: input.action,
    outcome: input.outcome,
    severity: input.severity,
    ipAddress: resolveClientIp(request),
    userAgent: resolveUserAgent(request),
    details: input.details,
  }).catch(() => null);
}

export async function GET(request: NextRequest) {
  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    role,
    permissions: getAdminPermissions(role),
  });
}

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    logAdminAuditEvent(request, {
      action: "admin.session.login",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const rateLimitResult = evaluateRateLimit({
    bucket: "admin.session.login",
    identifier: resolveClientIp(request),
    windowMs: 10 * 60 * 1000,
    max: 5,
    blockDurationMs: 30 * 60 * 1000,
  });
  if (!rateLimitResult.allowed) {
    logAdminAuditEvent(request, {
      action: "admin.session.login",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "rate_limited" },
    });
    return createRateLimitErrorResponse(
      rateLimitResult,
      "Too many login attempts. Please retry later.",
    );
  }

  const body = await request.json().catch(() => null);
  const validated = loginSchema.safeParse(body);
  if (!validated.success) {
    logAdminAuditEvent(request, {
      action: "admin.session.login",
      outcome: "failure",
      severity: "warning",
      details: { reason: "invalid_payload" },
    });
    return NextResponse.json({ error: "Invalid login payload" }, { status: 400 });
  }

  const role = resolveAdminRoleFromAuthToken(validated.data.token);
  if (!role) {
    logAdminAuditEvent(request, {
      action: "admin.session.login",
      outcome: "failure",
      severity: "warning",
      details: { reason: "invalid_credentials" },
    });
    return NextResponse.json({ error: "Invalid admin token" }, { status: 401 });
  }

  const sessionToken = createAdminSessionToken(role);
  const response = NextResponse.json({
    authenticated: true,
    role,
    permissions: getAdminPermissions(role),
  });

  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, sessionToken, cookieOptions());
  applyRateLimitHeaders(response, rateLimitResult);
  logAdminAuditEvent(request, {
    actorRole: role,
    action: "admin.session.login",
    outcome: "success",
    severity: "info",
  });
  return response;
}

export async function DELETE(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    logAdminAuditEvent(request, {
      action: "admin.session.logout",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const role = resolveAdminRoleFromRequest(request);
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
  logAdminAuditEvent(request, {
    actorRole: role ?? undefined,
    action: "admin.session.logout",
    outcome: "success",
    severity: "info",
  });
  return response;
}
