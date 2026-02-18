import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logAuditEvent } from "@/lib/audit/service";
import { resolveB2BAdminRole } from "@/lib/b2b/admin";
import { approveB2BAccount } from "@/lib/b2b/service";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

const approvalSchema = z.object({
  tier: z.enum(["starter", "growth", "enterprise"]),
  accountManagerName: z.string().trim().min(2).max(120),
  accountManagerEmail: z.string().trim().email(),
  accountManagerPhone: z.string().trim().max(40).optional(),
  status: z.enum(["approved", "suspended"]).optional(),
  regions: z.array(z.string().trim().min(2).max(80)).max(12).optional(),
});

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!isTrustedOrigin(request)) {
    void logAuditEvent({
      actorType: "admin",
      action: "admin.b2b.account.approval.update",
      outcome: "blocked",
      severity: "warning",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      details: { reason: "untrusted_origin" },
    }).catch(() => null);
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const role = resolveB2BAdminRole(request);
  if (!role) {
    void logAuditEvent({
      actorType: "admin",
      action: "admin.b2b.account.approval.update",
      outcome: "failure",
      severity: "warning",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      details: { reason: "unauthorized" },
    }).catch(() => null);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validated = approvalSchema.safeParse(body);
  if (!validated.success) {
    void logAuditEvent({
      actorType: "admin",
      actorRole: role,
      action: "admin.b2b.account.approval.update",
      outcome: "failure",
      severity: "warning",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      details: { reason: "invalid_payload" },
    }).catch(() => null);
    return NextResponse.json(
      { error: "Invalid approval payload", details: validated.error.flatten() },
      { status: 400 },
    );
  }

  const { id } = await Promise.resolve(context.params);
  try {
    const account = await approveB2BAccount(id, validated.data);
    void logAuditEvent({
      actorType: "admin",
      actorRole: role,
      action: "admin.b2b.account.approval.update",
      resourceType: "b2b.account",
      resourceId: id,
      outcome: "success",
      severity: "info",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      details: { status: account.status, tier: account.tier },
    }).catch(() => null);
    return NextResponse.json({ role, account });
  } catch (error) {
    void logAuditEvent({
      actorType: "admin",
      actorRole: role,
      action: "admin.b2b.account.approval.update",
      resourceType: "b2b.account",
      resourceId: id,
      outcome: "failure",
      severity: "warning",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      details: { reason: error instanceof Error ? error.message : "update_failed" },
    }).catch(() => null);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update account approval." },
      { status: 400 },
    );
  }
}
