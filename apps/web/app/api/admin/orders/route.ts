import { NextRequest, NextResponse } from "next/server";

import { hasAdminPermission, resolveAdminRoleFromRequest } from "@/lib/admin/auth";
import { listAdminOrders } from "@/lib/commerce/service";
import { type OrderStatus } from "@/lib/commerce/types";

export async function GET(request: NextRequest) {
  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasAdminPermission(role, "orders.read")) {
    return NextResponse.json({ error: "Forbidden: missing orders.read" }, { status: 403 });
  }

  const statusParam = request.nextUrl.searchParams.get("status");
  const status = statusParam
    ? ([
        "created",
        "payment_pending",
        "paid",
        "processing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ].includes(statusParam)
        ? (statusParam as OrderStatus)
        : undefined)
    : undefined;

  const email = request.nextUrl.searchParams.get("email") ?? undefined;
  const search = request.nextUrl.searchParams.get("search") ?? undefined;
  const orders = await listAdminOrders({ status, email, search });
  return NextResponse.json({ role, orders });
}
