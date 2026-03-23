import { NextRequest, NextResponse } from "next/server";

import { hasAdminPermission, resolveAdminRoleFromRequest } from "@/lib/admin/auth";
import { logAuditEvent } from "@/lib/audit/service";
import {
  deleteCmsMediaAsset,
  getCmsMediaAssetByIdWithUsage,
  updateCmsMediaAsset,
} from "@/lib/cms/service";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

import { updateMediaSchema } from "../schema";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

function logMediaAuditEvent(
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
    resourceType: "cms.media",
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
  if (error.message.toLowerCase().includes("cannot delete")) {
    return 409;
  }
  return 400;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasAdminPermission(role, "cms.media.read")) {
    return NextResponse.json({ error: "Forbidden: missing cms.media.read" }, { status: 403 });
  }

  const { id } = await Promise.resolve(context.params);
  const asset = await getCmsMediaAssetByIdWithUsage(id);
  if (!asset) {
    return NextResponse.json({ error: "Media asset not found." }, { status: 404 });
  }

  return NextResponse.json({ role, asset });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await Promise.resolve(context.params);

  if (!isTrustedOrigin(request)) {
    logMediaAuditEvent(request, {
      action: "admin.cms.media.update",
      outcome: "blocked",
      severity: "warning",
      resourceId: id,
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    logMediaAuditEvent(request, {
      action: "admin.cms.media.update",
      outcome: "failure",
      severity: "warning",
      resourceId: id,
      details: { reason: "unauthorized" },
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasAdminPermission(role, "cms.media.write")) {
    logMediaAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.media.update",
      outcome: "blocked",
      severity: "warning",
      resourceId: id,
      details: { reason: "missing_permission", permission: "cms.media.write" },
    });
    return NextResponse.json({ error: "Forbidden: missing cms.media.write" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const validated = updateMediaSchema.safeParse(body);
  if (!validated.success) {
    logMediaAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.media.update",
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
    const asset = await updateCmsMediaAsset(id, validated.data);
    logMediaAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.media.update",
      outcome: "success",
      severity: "info",
      resourceId: asset.id,
      details: { folder: asset.folder, url: asset.url },
    });
    return NextResponse.json({ role, asset });
  } catch (error) {
    logMediaAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.media.update",
      outcome: "failure",
      severity: "warning",
      resourceId: id,
      details: { reason: error instanceof Error ? error.message : "update_failed" },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update media asset." },
      { status: resolveErrorStatus(error) },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await Promise.resolve(context.params);

  if (!isTrustedOrigin(request)) {
    logMediaAuditEvent(request, {
      action: "admin.cms.media.delete",
      outcome: "blocked",
      severity: "warning",
      resourceId: id,
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    logMediaAuditEvent(request, {
      action: "admin.cms.media.delete",
      outcome: "failure",
      severity: "warning",
      resourceId: id,
      details: { reason: "unauthorized" },
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasAdminPermission(role, "cms.media.write")) {
    logMediaAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.media.delete",
      outcome: "blocked",
      severity: "warning",
      resourceId: id,
      details: { reason: "missing_permission", permission: "cms.media.write" },
    });
    return NextResponse.json({ error: "Forbidden: missing cms.media.write" }, { status: 403 });
  }

  try {
    const asset = await deleteCmsMediaAsset(id);
    logMediaAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.media.delete",
      outcome: "success",
      severity: "critical",
      resourceId: asset.id,
      details: { folder: asset.folder, url: asset.url },
    });
    return NextResponse.json({ role, asset });
  } catch (error) {
    logMediaAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.media.delete",
      outcome: "failure",
      severity: "warning",
      resourceId: id,
      details: { reason: error instanceof Error ? error.message : "delete_failed" },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete media asset." },
      { status: resolveErrorStatus(error) },
    );
  }
}
