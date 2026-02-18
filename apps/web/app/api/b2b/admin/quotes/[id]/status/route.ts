import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logAuditEvent } from "@/lib/audit/service";
import { resolveB2BAdminRole } from "@/lib/b2b/admin";
import { updateB2BQuoteStatusAsAdmin } from "@/lib/b2b/service";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

const statusSchema = z.object({
  status: z.enum(["submitted", "reviewing", "quoted", "approved", "rejected"]),
  note: z.string().trim().min(4).max(300),
});

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!isTrustedOrigin(request)) {
    void logAuditEvent({
      actorType: "admin",
      action: "admin.b2b.quote.status.update",
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
      action: "admin.b2b.quote.status.update",
      outcome: "failure",
      severity: "warning",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      details: { reason: "unauthorized" },
    }).catch(() => null);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validated = statusSchema.safeParse(body);
  if (!validated.success) {
    void logAuditEvent({
      actorType: "admin",
      actorRole: role,
      action: "admin.b2b.quote.status.update",
      outcome: "failure",
      severity: "warning",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      details: { reason: "invalid_payload" },
    }).catch(() => null);
    return NextResponse.json(
      { error: "Invalid quote status payload", details: validated.error.flatten() },
      { status: 400 },
    );
  }

  const { id } = await Promise.resolve(context.params);
  try {
    const quoteRequest = await updateB2BQuoteStatusAsAdmin(id, {
      status: validated.data.status,
      note: validated.data.note,
      role,
    });
    void logAuditEvent({
      actorType: "admin",
      actorRole: role,
      action: "admin.b2b.quote.status.update",
      resourceType: "b2b.quote",
      resourceId: id,
      outcome: "success",
      severity: "info",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      details: { status: quoteRequest.status },
    }).catch(() => null);
    return NextResponse.json({ role, quoteRequest });
  } catch (error) {
    void logAuditEvent({
      actorType: "admin",
      actorRole: role,
      action: "admin.b2b.quote.status.update",
      resourceType: "b2b.quote",
      resourceId: id,
      outcome: "failure",
      severity: "warning",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      details: { reason: error instanceof Error ? error.message : "update_failed" },
    }).catch(() => null);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update quote status." },
      { status: 400 },
    );
  }
}
