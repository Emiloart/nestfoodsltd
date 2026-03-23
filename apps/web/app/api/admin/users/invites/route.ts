import { NextRequest, NextResponse } from "next/server";

import { resolveAdminSessionFromRequest } from "@/lib/admin/auth";
import { createAdminInvite } from "@/lib/admin/user-directory";
import { logAuditEvent } from "@/lib/audit/service";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

import { createInviteSchema } from "../schema";

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

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    logAdminUserAuditEvent(request, {
      action: "admin.users.invite.create",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const session = resolveAdminSessionFromRequest(request);
  if (!session) {
    logAdminUserAuditEvent(request, {
      action: "admin.users.invite.create",
      outcome: "failure",
      severity: "warning",
      details: { reason: "unauthorized" },
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "SUPER_ADMIN") {
    logAdminUserAuditEvent(request, {
      actorId: session.actorId,
      actorRole: session.role,
      action: "admin.users.invite.create",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "missing_role", requiredRole: "SUPER_ADMIN" },
    });
    return NextResponse.json({ error: "Forbidden: requires SUPER_ADMIN role" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const validated = createInviteSchema.safeParse(body);
  if (!validated.success) {
    logAdminUserAuditEvent(request, {
      actorId: session.actorId,
      actorRole: session.role,
      action: "admin.users.invite.create",
      outcome: "failure",
      severity: "warning",
      details: { reason: "invalid_payload" },
    });
    return NextResponse.json(
      { error: "Invalid invite payload.", details: validated.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await createAdminInvite({
      ...validated.data,
      invitedByRole: session.role,
      invitedByUserId: session.actorId,
    });

    logAdminUserAuditEvent(request, {
      actorId: session.actorId,
      actorRole: session.role,
      action: "admin.users.invite.create",
      outcome: "success",
      severity: "info",
      resourceId: result.invite.id,
      details: { email: result.invite.email, role: result.invite.role },
    });

    return NextResponse.json(
      {
        role: session.role,
        invite: result.invite,
        inviteToken: result.inviteToken,
      },
      { status: 201 },
    );
  } catch (error) {
    logAdminUserAuditEvent(request, {
      actorId: session.actorId,
      actorRole: session.role,
      action: "admin.users.invite.create",
      outcome: "failure",
      severity: "warning",
      details: { reason: error instanceof Error ? error.message : "invite_create_failed" },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create invite." },
      { status: 400 },
    );
  }
}
