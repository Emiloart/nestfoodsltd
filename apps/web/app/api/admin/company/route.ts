import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { hasAdminPermission, resolveAdminRoleFromRequest } from "@/lib/admin/auth";
import { logAuditEvent } from "@/lib/audit/service";
import { getCompanyContent, updateCompanyContent } from "@/lib/company/service";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

import { updateCompanyContentSchema } from "./schema";

function logCompanyAuditEvent(
  request: NextRequest,
  input: {
    actorRole?: string;
    action: string;
    outcome: "success" | "failure" | "blocked";
    severity: "info" | "warning" | "critical";
    details?: Record<string, unknown>;
  },
) {
  void logAuditEvent({
    actorType: "admin",
    actorRole: input.actorRole,
    action: input.action,
    resourceType: "company.content",
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

  const company = await getCompanyContent();
  return NextResponse.json({ role, company });
}

export async function PUT(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    logCompanyAuditEvent(request, {
      action: "admin.company.update",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    logCompanyAuditEvent(request, {
      action: "admin.company.update",
      outcome: "failure",
      severity: "warning",
      details: { reason: "unauthorized" },
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasAdminPermission(role, "cms.pages.write")) {
    logCompanyAuditEvent(request, {
      actorRole: role,
      action: "admin.company.update",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "missing_permission", permission: "cms.pages.write" },
    });
    return NextResponse.json({ error: "Forbidden: missing cms.pages.write" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const validated = updateCompanyContentSchema.safeParse(body);
  if (!validated.success) {
    logCompanyAuditEvent(request, {
      actorRole: role,
      action: "admin.company.update",
      outcome: "failure",
      severity: "warning",
      details: { reason: "invalid_payload" },
    });
    return NextResponse.json(
      { error: "Invalid company content payload.", details: validated.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const company = await updateCompanyContent({
      ...validated.data,
      updatedAt: validated.data.updatedAt ?? "",
    });
    revalidatePath("/", "layout");
    ["/", "/about", "/contact", "/careers"].forEach((path) => revalidatePath(path));
    logCompanyAuditEvent(request, {
      actorRole: role,
      action: "admin.company.update",
      outcome: "success",
      severity: "info",
      details: {
        contacts: company.contactChannels.length,
        branches: company.branchLocations.length,
        socials: company.socialChannels.length,
      },
    });
    return NextResponse.json({ role, company });
  } catch (error) {
    logCompanyAuditEvent(request, {
      actorRole: role,
      action: "admin.company.update",
      outcome: "failure",
      severity: "warning",
      details: { reason: error instanceof Error ? error.message : "update_failed" },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update company content." },
      { status: 400 },
    );
  }
}
