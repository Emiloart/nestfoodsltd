import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { hasAdminPermission, resolveAdminRoleFromRequest } from "@/lib/admin/auth";
import { logAuditEvent } from "@/lib/audit/service";
import { deleteCmsBanner, getCmsBannerById, updateCmsBanner } from "@/lib/cms/service";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

import { updateBannerSchema } from "../schema";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

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

function resolveErrorStatus(error: unknown) {
  if (!(error instanceof Error)) {
    return 400;
  }
  if (error.message.toLowerCase().includes("not found")) {
    return 404;
  }
  return 400;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasAdminPermission(role, "cms.pages.read")) {
    return NextResponse.json({ error: "Forbidden: missing cms.pages.read" }, { status: 403 });
  }

  const { id } = await Promise.resolve(context.params);
  const banner = await getCmsBannerById(id);
  if (!banner) {
    return NextResponse.json({ error: "Banner not found." }, { status: 404 });
  }

  return NextResponse.json({ role, banner });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await Promise.resolve(context.params);

  if (!isTrustedOrigin(request)) {
    logBannerAuditEvent(request, {
      action: "admin.cms.banner.update",
      outcome: "blocked",
      severity: "warning",
      resourceId: id,
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    logBannerAuditEvent(request, {
      action: "admin.cms.banner.update",
      outcome: "failure",
      severity: "warning",
      resourceId: id,
      details: { reason: "unauthorized" },
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasAdminPermission(role, "cms.pages.write")) {
    logBannerAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.banner.update",
      outcome: "blocked",
      severity: "warning",
      resourceId: id,
      details: { reason: "missing_permission", permission: "cms.pages.write" },
    });
    return NextResponse.json({ error: "Forbidden: missing cms.pages.write" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const validated = updateBannerSchema.safeParse(body);
  if (!validated.success) {
    logBannerAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.banner.update",
      outcome: "failure",
      severity: "warning",
      resourceId: id,
      details: { reason: "invalid_payload" },
    });
    return NextResponse.json(
      { error: "Invalid update payload.", details: validated.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const banner = await updateCmsBanner(id, validated.data);
    revalidatePath("/");
    logBannerAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.banner.update",
      outcome: "success",
      severity: "info",
      resourceId: banner.id,
      details: { status: banner.status, order: banner.order },
    });
    return NextResponse.json({ role, banner });
  } catch (error) {
    logBannerAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.banner.update",
      outcome: "failure",
      severity: "warning",
      resourceId: id,
      details: { reason: error instanceof Error ? error.message : "update_failed" },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update banner." },
      { status: resolveErrorStatus(error) },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await Promise.resolve(context.params);

  if (!isTrustedOrigin(request)) {
    logBannerAuditEvent(request, {
      action: "admin.cms.banner.delete",
      outcome: "blocked",
      severity: "warning",
      resourceId: id,
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    logBannerAuditEvent(request, {
      action: "admin.cms.banner.delete",
      outcome: "failure",
      severity: "warning",
      resourceId: id,
      details: { reason: "unauthorized" },
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasAdminPermission(role, "cms.pages.write")) {
    logBannerAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.banner.delete",
      outcome: "blocked",
      severity: "warning",
      resourceId: id,
      details: { reason: "missing_permission", permission: "cms.pages.write" },
    });
    return NextResponse.json({ error: "Forbidden: missing cms.pages.write" }, { status: 403 });
  }

  try {
    const banner = await deleteCmsBanner(id);
    revalidatePath("/");
    logBannerAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.banner.delete",
      outcome: "success",
      severity: "critical",
      resourceId: banner.id,
      details: { status: banner.status, order: banner.order },
    });
    return NextResponse.json({ role, banner });
  } catch (error) {
    logBannerAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.banner.delete",
      outcome: "failure",
      severity: "warning",
      resourceId: id,
      details: { reason: error instanceof Error ? error.message : "delete_failed" },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete banner." },
      { status: resolveErrorStatus(error) },
    );
  }
}
