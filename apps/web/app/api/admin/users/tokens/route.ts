import { NextRequest, NextResponse } from "next/server";

import { rotateAdminAccessToken } from "@/lib/admin/access-tokens";
import { resolveAdminSessionFromRequest } from "@/lib/admin/auth";
import { logAuditEvent } from "@/lib/audit/service";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

import { rotateAdminAccessTokenSchema } from "../schema";

function logAdminTokenAuditEvent(
  request: NextRequest,
  input: {
    actorId?: string;
    actorRole?: string;
    action: string;
    outcome: "success" | "failure" | "blocked";
    severity: "info" | "warning" | "critical";
    resourceId?: string;
    details?: Record<string, unknown>;
  },
) {
  void logAuditEvent({
    actorType: "admin",
    actorId: input.actorId,
    actorRole: input.actorRole,
    action: input.action,
    resourceType: "admin.access_token",
    resourceId: input.resourceId,
    outcome: input.outcome,
    severity: input.severity,
    ipAddress: resolveClientIp(request),
    userAgent: resolveUserAgent(request),
    details: input.details,
  }).catch(() => null);
}

export async function PUT(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    logAdminTokenAuditEvent(request, {
      action: "admin.users.token.rotate",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const session = resolveAdminSessionFromRequest(request);
  if (!session) {
    logAdminTokenAuditEvent(request, {
      action: "admin.users.token.rotate",
      outcome: "failure",
      severity: "warning",
      details: { reason: "unauthorized" },
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "SUPER_ADMIN") {
    logAdminTokenAuditEvent(request, {
      actorId: session.actorId,
      actorRole: session.role,
      action: "admin.users.token.rotate",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "missing_role", requiredRole: "SUPER_ADMIN" },
    });
    return NextResponse.json({ error: "Forbidden: requires SUPER_ADMIN role" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const validated = rotateAdminAccessTokenSchema.safeParse(body);
  if (!validated.success) {
    logAdminTokenAuditEvent(request, {
      actorId: session.actorId,
      actorRole: session.role,
      action: "admin.users.token.rotate",
      outcome: "failure",
      severity: "warning",
      details: { reason: "invalid_payload" },
    });
    return NextResponse.json(
      { error: "Invalid token rotation payload.", details: validated.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const accessToken = await rotateAdminAccessToken({
      ...validated.data,
      updatedByUserId: session.actorId,
      updatedByRole: session.role,
    });
    logAdminTokenAuditEvent(request, {
      actorId: session.actorId,
      actorRole: session.role,
      action: "admin.users.token.rotate",
      outcome: "success",
      severity: "info",
      resourceId: accessToken.role,
      details: { role: accessToken.role },
    });

    return NextResponse.json({ role: session.role, accessToken });
  } catch (error) {
    logAdminTokenAuditEvent(request, {
      actorId: session.actorId,
      actorRole: session.role,
      action: "admin.users.token.rotate",
      outcome: "failure",
      severity: "warning",
      details: { reason: error instanceof Error ? error.message : "token_rotation_failed" },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to rotate access token." },
      { status: 400 },
    );
  }
}
