import { NextRequest, NextResponse } from "next/server";

import { resolveAdminSessionFromRequest } from "@/lib/admin/auth";
import { updateAdminUser } from "@/lib/admin/user-directory";
import { logAuditEvent } from "@/lib/audit/service";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

import { updateAdminUserSchema } from "../schema";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

function logAdminUserAuditEvent(
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
    resourceType: "admin.user",
    resourceId: input.resourceId,
    outcome: input.outcome,
    severity: input.severity,
    ipAddress: resolveClientIp(request),
    userAgent: resolveUserAgent(request),
    details: input.details,
  }).catch(() => null);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await Promise.resolve(context.params);
  if (!isTrustedOrigin(request)) {
    logAdminUserAuditEvent(request, {
      action: "admin.users.user.update",
      outcome: "blocked",
      severity: "warning",
      resourceId: id,
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const session = resolveAdminSessionFromRequest(request);
  if (!session) {
    logAdminUserAuditEvent(request, {
      action: "admin.users.user.update",
      outcome: "failure",
      severity: "warning",
      resourceId: id,
      details: { reason: "unauthorized" },
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "SUPER_ADMIN") {
    logAdminUserAuditEvent(request, {
      actorId: session.actorId,
      actorRole: session.role,
      action: "admin.users.user.update",
      outcome: "blocked",
      severity: "warning",
      resourceId: id,
      details: { reason: "missing_role", requiredRole: "SUPER_ADMIN" },
    });
    return NextResponse.json({ error: "Forbidden: requires SUPER_ADMIN role" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const validated = updateAdminUserSchema.safeParse(body);
  if (!validated.success) {
    logAdminUserAuditEvent(request, {
      actorId: session.actorId,
      actorRole: session.role,
      action: "admin.users.user.update",
      outcome: "failure",
      severity: "warning",
      resourceId: id,
      details: { reason: "invalid_payload" },
    });
    return NextResponse.json(
      { error: "Invalid user update payload.", details: validated.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const user = await updateAdminUser({
      userId: id,
      ...validated.data,
    });
    logAdminUserAuditEvent(request, {
      actorId: session.actorId,
      actorRole: session.role,
      action: "admin.users.user.update",
      outcome: "success",
      severity: "info",
      resourceId: user.id,
      details: { role: user.role, status: user.status, mfaRequired: user.mfaRequired },
    });
    return NextResponse.json({ role: session.role, user });
  } catch (error) {
    logAdminUserAuditEvent(request, {
      actorId: session.actorId,
      actorRole: session.role,
      action: "admin.users.user.update",
      outcome: "failure",
      severity: "warning",
      resourceId: id,
      details: { reason: error instanceof Error ? error.message : "user_update_failed" },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update admin user." },
      { status: 400 },
    );
  }
}
