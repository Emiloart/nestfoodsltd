import { NextRequest, NextResponse } from "next/server";

import { activateAdminInvite } from "@/lib/admin/user-directory";
import { logAuditEvent } from "@/lib/audit/service";
import {
  applyRateLimitHeaders,
  createRateLimitErrorResponse,
  evaluateRateLimit,
} from "@/lib/security/rate-limit";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

import { activateInviteSchema } from "./schema";

function logActivationAuditEvent(
  request: NextRequest,
  input: {
    actorType: "admin" | "anonymous";
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
    actorType: input.actorType,
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
    logActivationAuditEvent(request, {
      actorType: "anonymous",
      action: "admin.users.invite.activate",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const rateLimitResult = evaluateRateLimit({
    bucket: "admin.users.invite.activate",
    identifier: resolveClientIp(request),
    windowMs: 10 * 60 * 1000,
    max: 10,
    blockDurationMs: 15 * 60 * 1000,
  });
  if (!rateLimitResult.allowed) {
    logActivationAuditEvent(request, {
      actorType: "anonymous",
      action: "admin.users.invite.activate",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "rate_limited" },
    });
    return createRateLimitErrorResponse(
      rateLimitResult,
      "Too many activation attempts. Please retry later.",
    );
  }

  const body = await request.json().catch(() => null);
  const validated = activateInviteSchema.safeParse(body);
  if (!validated.success) {
    logActivationAuditEvent(request, {
      actorType: "anonymous",
      action: "admin.users.invite.activate",
      outcome: "failure",
      severity: "warning",
      details: { reason: "invalid_payload" },
    });
    const response = NextResponse.json(
      { error: "Invalid activation payload.", details: validated.error.flatten() },
      { status: 400 },
    );
    applyRateLimitHeaders(response, rateLimitResult);
    return response;
  }

  try {
    const result = await activateAdminInvite(validated.data);
    logActivationAuditEvent(request, {
      actorType: "admin",
      actorId: result.user.id,
      actorRole: result.user.role,
      action: "admin.users.invite.activate",
      outcome: "success",
      severity: "info",
      resourceId: result.user.id,
      details: { email: result.user.email, role: result.user.role },
    });

    const response = NextResponse.json(
      {
        activated: true,
        user: result.user,
      },
      { status: 201 },
    );
    applyRateLimitHeaders(response, rateLimitResult);
    return response;
  } catch (error) {
    logActivationAuditEvent(request, {
      actorType: "anonymous",
      action: "admin.users.invite.activate",
      outcome: "failure",
      severity: "warning",
      details: { reason: error instanceof Error ? error.message : "invite_activation_failed" },
    });
    const response = NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to activate invite." },
      { status: 400 },
    );
    applyRateLimitHeaders(response, rateLimitResult);
    return response;
  }
}
