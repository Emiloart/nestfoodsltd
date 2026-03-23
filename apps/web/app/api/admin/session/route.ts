import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  ADMIN_SESSION_COOKIE_NAME,
  createAdminSessionToken,
  getAdminPermissions,
  resolveAdminSessionFromRequest,
  resolveAdminRoleFromAuthToken,
} from "@/lib/admin/auth";
import { authenticateAdminDirectoryUser } from "@/lib/admin/user-directory";
import { logAuditEvent } from "@/lib/audit/service";
import {
  applyRateLimitHeaders,
  createRateLimitErrorResponse,
  evaluateRateLimit,
} from "@/lib/security/rate-limit";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

const tokenLoginSchema = z.object({
  token: z.string().trim().min(8),
});

const credentialLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().trim().min(12),
  mfaCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/)
    .optional(),
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
    actorId?: string;
    actorRole?: string;
    action: string;
    outcome: "success" | "failure" | "blocked";
    severity: "info" | "warning" | "critical";
    details?: Record<string, unknown>;
  },
) {
  void logAuditEvent({
    actorType: "admin",
    actorId: input.actorId,
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
  const session = resolveAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    role: session.role,
    source: session.source,
    actorId: session.actorId,
    permissions: getAdminPermissions(session.role),
  });
}

function resolveCredentialFailureResponse(
  reason:
    | "invalid_credentials"
    | "mfa_required"
    | "mfa_invalid"
    | "mfa_not_configured"
    | "account_suspended"
    | "account_locked",
) {
  switch (reason) {
    case "mfa_required":
      return { status: 401, message: "MFA code is required for this account." };
    case "mfa_invalid":
      return { status: 401, message: "Invalid MFA code." };
    case "mfa_not_configured":
      return { status: 403, message: "Account requires MFA enrollment before sign-in." };
    case "account_suspended":
      return { status: 403, message: "Admin account is suspended." };
    case "account_locked":
      return { status: 423, message: "Account is temporarily locked." };
    case "invalid_credentials":
    default:
      return { status: 401, message: "Invalid email or password." };
  }
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
  const tokenLogin = tokenLoginSchema.safeParse(body);
  const credentialLogin = credentialLoginSchema.safeParse(body);
  if (!tokenLogin.success && !credentialLogin.success) {
    logAdminAuditEvent(request, {
      action: "admin.session.login",
      outcome: "failure",
      severity: "warning",
      details: { reason: "invalid_payload" },
    });
    return NextResponse.json({ error: "Invalid login payload" }, { status: 400 });
  }

  if (tokenLogin.success) {
    const role = resolveAdminRoleFromAuthToken(tokenLogin.data.token);
    if (!role) {
      logAdminAuditEvent(request, {
        action: "admin.session.login",
        outcome: "failure",
        severity: "warning",
        details: { reason: "invalid_credentials", mode: "token" },
      });
      return NextResponse.json({ error: "Invalid admin token" }, { status: 401 });
    }

    const sessionToken = createAdminSessionToken(role);
    const response = NextResponse.json({
      authenticated: true,
      role,
      source: "break_glass_token",
      permissions: getAdminPermissions(role),
    });

    response.cookies.set(ADMIN_SESSION_COOKIE_NAME, sessionToken, cookieOptions());
    applyRateLimitHeaders(response, rateLimitResult);
    logAdminAuditEvent(request, {
      actorRole: role,
      action: "admin.session.login",
      outcome: "success",
      severity: "info",
      details: { mode: "token" },
    });
    return response;
  }

  const credentialResult = await authenticateAdminDirectoryUser(credentialLogin.data);
  if (!credentialResult.authenticated) {
    const failure = resolveCredentialFailureResponse(credentialResult.reason);
    logAdminAuditEvent(request, {
      action: "admin.session.login",
      outcome: "failure",
      severity: "warning",
      details: {
        reason: credentialResult.reason,
        mode: "credentials",
        email: credentialLogin.data.email,
      },
    });
    return NextResponse.json(
      {
        error: failure.message,
        reason: credentialResult.reason,
        retryAfterSeconds: credentialResult.retryAfterSeconds,
      },
      { status: failure.status },
    );
  }

  const sessionToken = createAdminSessionToken(credentialResult.user.role, {
    adminUserId: credentialResult.user.id,
  });
  const response = NextResponse.json({
    authenticated: true,
    role: credentialResult.user.role,
    source: "managed_user",
    actorId: credentialResult.user.id,
    userEmail: credentialResult.user.email,
    permissions: getAdminPermissions(credentialResult.user.role),
  });

  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, sessionToken, cookieOptions());
  applyRateLimitHeaders(response, rateLimitResult);
  logAdminAuditEvent(request, {
    actorId: credentialResult.user.id,
    actorRole: credentialResult.user.role,
    action: "admin.session.login",
    outcome: "success",
    severity: "info",
    details: {
      mode: "credentials",
      email: credentialResult.user.email,
    },
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

  const session = resolveAdminSessionFromRequest(request);
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
  logAdminAuditEvent(request, {
    actorId: session?.actorId,
    actorRole: session?.role,
    action: "admin.session.logout",
    outcome: "success",
    severity: "info",
  });
  return response;
}
