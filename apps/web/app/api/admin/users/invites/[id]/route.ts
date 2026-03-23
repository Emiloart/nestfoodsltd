import { NextRequest, NextResponse } from "next/server";

import { resolveAdminSessionFromRequest } from "@/lib/admin/auth";
import { revokeAdminInvite } from "@/lib/admin/user-directory";
import { logAuditEvent } from "@/lib/audit/service";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

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
    resourceType: "admin.invite",
    resourceId: input.resourceId,
    outcome: input.outcome,
    severity: input.severity,
    ipAddress: resolveClientIp(request),
    userAgent: resolveUserAgent(request),
    details: input.details,
  }).catch(() => null);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await Promise.resolve(context.params);

  if (!isTrustedOrigin(request)) {
    logAdminUserAuditEvent(request, {
      action: "admin.users.invite.revoke",
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
      action: "admin.users.invite.revoke",
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
      action: "admin.users.invite.revoke",
      outcome: "blocked",
      severity: "warning",
      resourceId: id,
      details: { reason: "missing_role", requiredRole: "SUPER_ADMIN" },
    });
    return NextResponse.json({ error: "Forbidden: requires SUPER_ADMIN role" }, { status: 403 });
  }

  try {
    const invite = await revokeAdminInvite(id);
    logAdminUserAuditEvent(request, {
      actorId: session.actorId,
      actorRole: session.role,
      action: "admin.users.invite.revoke",
      outcome: "success",
      severity: "info",
      resourceId: invite.id,
      details: { email: invite.email, status: invite.status },
    });
    return NextResponse.json({ role: session.role, invite });
  } catch (error) {
    logAdminUserAuditEvent(request, {
      actorId: session.actorId,
      actorRole: session.role,
      action: "admin.users.invite.revoke",
      outcome: "failure",
      severity: "warning",
      resourceId: id,
      details: { reason: error instanceof Error ? error.message : "invite_revoke_failed" },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to revoke invite." },
      { status: 400 },
    );
  }
}
