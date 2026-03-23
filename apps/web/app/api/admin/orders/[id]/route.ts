import { NextRequest, NextResponse } from "next/server";

import { hasAdminPermission, resolveAdminRoleFromRequest } from "@/lib/admin/auth";
import { logAuditEvent } from "@/lib/audit/service";
import { getAdminOrderById, updateAdminOrderStatus } from "@/lib/commerce/service";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

import { updateOrderStatusSchema } from "../schema";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

function logOrderAuditEvent(
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
    resourceType: "commerce.order",
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
  if (error.message.toLowerCase().includes("invalid status transition")) {
    return 409;
  }
  return 400;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasAdminPermission(role, "orders.read")) {
    return NextResponse.json({ error: "Forbidden: missing orders.read" }, { status: 403 });
  }

  const { id } = await Promise.resolve(context.params);
  const order = await getAdminOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ role, order });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await Promise.resolve(context.params);

  if (!isTrustedOrigin(request)) {
    logOrderAuditEvent(request, {
      action: "admin.orders.status.update",
      outcome: "blocked",
      severity: "warning",
      resourceId: id,
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    logOrderAuditEvent(request, {
      action: "admin.orders.status.update",
      outcome: "failure",
      severity: "warning",
      resourceId: id,
      details: { reason: "unauthorized" },
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasAdminPermission(role, "orders.write")) {
    logOrderAuditEvent(request, {
      actorRole: role,
      action: "admin.orders.status.update",
      outcome: "blocked",
      severity: "warning",
      resourceId: id,
      details: { reason: "missing_permission", permission: "orders.write" },
    });
    return NextResponse.json({ error: "Forbidden: missing orders.write" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const validated = updateOrderStatusSchema.safeParse(body);
  if (!validated.success) {
    logOrderAuditEvent(request, {
      actorRole: role,
      action: "admin.orders.status.update",
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
    const order = await updateAdminOrderStatus({
      orderId: id,
      status: validated.data.status,
      note: validated.data.note,
      actorRole: role,
    });
    logOrderAuditEvent(request, {
      actorRole: role,
      action: "admin.orders.status.update",
      outcome: "success",
      severity: "info",
      resourceId: order.id,
      details: { orderNumber: order.orderNumber, status: order.status },
    });
    return NextResponse.json({ role, order });
  } catch (error) {
    logOrderAuditEvent(request, {
      actorRole: role,
      action: "admin.orders.status.update",
      outcome: "failure",
      severity: "warning",
      resourceId: id,
      details: { reason: error instanceof Error ? error.message : "update_failed" },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update order." },
      { status: resolveErrorStatus(error) },
    );
  }
}
