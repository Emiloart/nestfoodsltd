import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { hasAdminPermission, resolveAdminRoleFromRequest } from "@/lib/admin/auth";
import { logAuditEvent } from "@/lib/audit/service";
import { createCmsBanner, getCmsBanners } from "@/lib/cms/service";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

import { createBannerSchema } from "./schema";

function logBannerAuditEvent(
  request: NextRequest,
  input: {
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
    actorRole: input.actorRole,
    action: input.action,
    resourceType: "cms.banner",
    resourceId: input.resourceId,
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasAdminPermission(role, "cms.pages.read")) {
    return NextResponse.json({ error: "Forbidden: missing cms.pages.read" }, { status: 403 });
  }

  const banners = await getCmsBanners({ preview: true });
  return NextResponse.json({ role, banners });
}

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    logBannerAuditEvent(request, {
      action: "admin.cms.banner.create",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    logBannerAuditEvent(request, {
      action: "admin.cms.banner.create",
      outcome: "failure",
      severity: "warning",
      details: { reason: "unauthorized" },
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasAdminPermission(role, "cms.pages.write")) {
    logBannerAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.banner.create",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "missing_permission", permission: "cms.pages.write" },
    });
    return NextResponse.json({ error: "Forbidden: missing cms.pages.write" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const validated = createBannerSchema.safeParse(body);
  if (!validated.success) {
    logBannerAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.banner.create",
      outcome: "failure",
      severity: "warning",
      details: { reason: "invalid_payload" },
    });
    return NextResponse.json(
      { error: "Invalid banner payload.", details: validated.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const banner = await createCmsBanner({
      ...validated.data,
      order: validated.data.order ?? 1,
    });
    revalidatePath("/");
    logBannerAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.banner.create",
      outcome: "success",
      severity: "info",
      resourceId: banner.id,
      details: { status: banner.status, order: banner.order },
    });
    return NextResponse.json({ role, banner }, { status: 201 });
  } catch (error) {
    logBannerAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.banner.create",
      outcome: "failure",
      severity: "warning",
      details: { reason: error instanceof Error ? error.message : "create_failed" },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create banner." },
      { status: 400 },
    );
  }
}
