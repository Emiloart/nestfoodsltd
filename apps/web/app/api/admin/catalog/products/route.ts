import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { hasAdminPermission, resolveAdminRoleFromRequest } from "@/lib/admin/auth";
import { logAuditEvent } from "@/lib/audit/service";
import { createAdminCommerceProduct, listAdminCommerceProducts } from "@/lib/commerce/service";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";
import { createProductSchema } from "./schema";

function logCatalogAuditEvent(
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
    resourceType: "commerce.product",
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
  if (!hasAdminPermission(role, "cms.catalog.read")) {
    return NextResponse.json({ error: "Forbidden: missing cms.catalog.read" }, { status: 403 });
  }

  const products = await listAdminCommerceProducts();
  return NextResponse.json({ role, products });
}

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    logCatalogAuditEvent(request, {
      action: "admin.catalog.product.create",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    logCatalogAuditEvent(request, {
      action: "admin.catalog.product.create",
      outcome: "failure",
      severity: "warning",
      details: { reason: "unauthorized" },
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasAdminPermission(role, "cms.catalog.write")) {
    logCatalogAuditEvent(request, {
      actorRole: role,
      action: "admin.catalog.product.create",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "missing_permission", permission: "cms.catalog.write" },
    });
    return NextResponse.json({ error: "Forbidden: missing cms.catalog.write" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const validated = createProductSchema.safeParse(body);
  if (!validated.success) {
    logCatalogAuditEvent(request, {
      actorRole: role,
      action: "admin.catalog.product.create",
      outcome: "failure",
      severity: "warning",
      details: { reason: "invalid_payload" },
    });
    return NextResponse.json(
      { error: "Invalid product payload.", details: validated.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const product = await createAdminCommerceProduct(validated.data);
    revalidatePath("/shop");
    revalidatePath("/b2b");
    revalidatePath(`/products/${product.slug}`);
    logCatalogAuditEvent(request, {
      actorRole: role,
      action: "admin.catalog.product.create",
      outcome: "success",
      severity: "info",
      resourceId: product.id,
      details: { slug: product.slug },
    });
    return NextResponse.json({ role, product }, { status: 201 });
  } catch (error) {
    logCatalogAuditEvent(request, {
      actorRole: role,
      action: "admin.catalog.product.create",
      outcome: "failure",
      severity: "warning",
      details: { reason: error instanceof Error ? error.message : "create_failed" },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product." },
      { status: 400 },
    );
  }
}
