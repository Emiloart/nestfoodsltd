import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { hasAdminPermission, resolveAdminRoleFromRequest } from "@/lib/admin/auth";
import { logAuditEvent } from "@/lib/audit/service";
import {
  deleteAdminCommerceProduct,
  getAdminCommerceProductById,
  updateAdminCommerceProduct,
} from "@/lib/commerce/service";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

import { updateProductSchema } from "../schema";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

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
  if (!hasAdminPermission(role, "cms.catalog.read")) {
    return NextResponse.json({ error: "Forbidden: missing cms.catalog.read" }, { status: 403 });
  }

  const { id } = await Promise.resolve(context.params);
  const product = await getAdminCommerceProductById(id);
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json({ role, product });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await Promise.resolve(context.params);

  if (!isTrustedOrigin(request)) {
    logCatalogAuditEvent(request, {
      action: "admin.catalog.product.update",
      outcome: "blocked",
      severity: "warning",
      resourceId: id,
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    logCatalogAuditEvent(request, {
      action: "admin.catalog.product.update",
      outcome: "failure",
      severity: "warning",
      resourceId: id,
      details: { reason: "unauthorized" },
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasAdminPermission(role, "cms.catalog.write")) {
    logCatalogAuditEvent(request, {
      actorRole: role,
      action: "admin.catalog.product.update",
      outcome: "blocked",
      severity: "warning",
      resourceId: id,
      details: { reason: "missing_permission", permission: "cms.catalog.write" },
    });
    return NextResponse.json({ error: "Forbidden: missing cms.catalog.write" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const validated = updateProductSchema.safeParse(body);
  if (!validated.success) {
    logCatalogAuditEvent(request, {
      actorRole: role,
      action: "admin.catalog.product.update",
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
    const existingProduct = await getAdminCommerceProductById(id);
    const product = await updateAdminCommerceProduct(id, validated.data);
    revalidatePath("/shop");
    revalidatePath("/b2b");
    if (existingProduct?.slug && existingProduct.slug !== product.slug) {
      revalidatePath(`/products/${existingProduct.slug}`);
    }
    revalidatePath(`/products/${product.slug}`);
    logCatalogAuditEvent(request, {
      actorRole: role,
      action: "admin.catalog.product.update",
      outcome: "success",
      severity: "info",
      resourceId: product.id,
      details: { slug: product.slug },
    });
    return NextResponse.json({ role, product });
  } catch (error) {
    logCatalogAuditEvent(request, {
      actorRole: role,
      action: "admin.catalog.product.update",
      outcome: "failure",
      severity: "warning",
      resourceId: id,
      details: { reason: error instanceof Error ? error.message : "update_failed" },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update product." },
      { status: resolveErrorStatus(error) },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await Promise.resolve(context.params);

  if (!isTrustedOrigin(request)) {
    logCatalogAuditEvent(request, {
      action: "admin.catalog.product.delete",
      outcome: "blocked",
      severity: "warning",
      resourceId: id,
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    logCatalogAuditEvent(request, {
      action: "admin.catalog.product.delete",
      outcome: "failure",
      severity: "warning",
      resourceId: id,
      details: { reason: "unauthorized" },
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasAdminPermission(role, "cms.catalog.write")) {
    logCatalogAuditEvent(request, {
      actorRole: role,
      action: "admin.catalog.product.delete",
      outcome: "blocked",
      severity: "warning",
      resourceId: id,
      details: { reason: "missing_permission", permission: "cms.catalog.write" },
    });
    return NextResponse.json({ error: "Forbidden: missing cms.catalog.write" }, { status: 403 });
  }

  try {
    const existingProduct = await getAdminCommerceProductById(id);
    const product = await deleteAdminCommerceProduct(id);
    revalidatePath("/shop");
    revalidatePath("/b2b");
    if (existingProduct?.slug) {
      revalidatePath(`/products/${existingProduct.slug}`);
    } else {
      revalidatePath("/products/[slug]", "page");
    }
    logCatalogAuditEvent(request, {
      actorRole: role,
      action: "admin.catalog.product.delete",
      outcome: "success",
      severity: "critical",
      resourceId: product.id,
      details: { slug: product.slug },
    });
    return NextResponse.json({ role, product });
  } catch (error) {
    logCatalogAuditEvent(request, {
      actorRole: role,
      action: "admin.catalog.product.delete",
      outcome: "failure",
      severity: "warning",
      resourceId: id,
      details: { reason: error instanceof Error ? error.message : "delete_failed" },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete product." },
      { status: resolveErrorStatus(error) },
    );
  }
}
