import { NextRequest, NextResponse } from "next/server";

import { hasAdminPermission, resolveAdminRoleFromRequest } from "@/lib/admin/auth";
import { logAuditEvent } from "@/lib/audit/service";
import { createCmsMediaAsset, getCmsMediaAssetsWithUsage } from "@/lib/cms/service";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

import { createMediaSchema } from "./schema";

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

export async function GET(request: NextRequest) {
  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasAdminPermission(role, "cms.media.read")) {
    return NextResponse.json({ error: "Forbidden: missing cms.media.read" }, { status: 403 });
  }

  const assets = await getCmsMediaAssetsWithUsage();
  return NextResponse.json({ role, assets });
}

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    logMediaAuditEvent(request, {
      action: "admin.cms.media.create",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    logMediaAuditEvent(request, {
      action: "admin.cms.media.create",
      outcome: "failure",
      severity: "warning",
      details: { reason: "unauthorized" },
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasAdminPermission(role, "cms.media.write")) {
    logMediaAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.media.create",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "missing_permission", permission: "cms.media.write" },
    });
    return NextResponse.json({ error: "Forbidden: missing cms.media.write" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const validated = createMediaSchema.safeParse(body);
  if (!validated.success) {
    logMediaAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.media.create",
      outcome: "failure",
      severity: "warning",
      details: { reason: "invalid_payload" },
    });
    return NextResponse.json(
      { error: "Invalid media payload.", details: validated.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const asset = await createCmsMediaAsset(validated.data);
    logMediaAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.media.create",
      outcome: "success",
      severity: "info",
      resourceId: asset.id,
      details: { folder: asset.folder, url: asset.url },
    });
    return NextResponse.json({ role, asset }, { status: 201 });
  } catch (error) {
    logMediaAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.media.create",
      outcome: "failure",
      severity: "warning",
      details: { reason: error instanceof Error ? error.message : "create_failed" },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create media asset." },
      { status: 400 },
    );
  }
}
