import { NextRequest, NextResponse } from "next/server";

import { hasAdminPermission, resolveAdminRoleFromRequest } from "@/lib/admin/auth";
import { listAdminPaymentWebhookEvents } from "@/lib/commerce/service";
import { type PaymentProvider } from "@/lib/commerce/types";

export async function GET(request: NextRequest) {
  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasAdminPermission(role, "orders.read")) {
    return NextResponse.json({ error: "Forbidden: missing orders.read" }, { status: 403 });
  }

  const providerParam = request.nextUrl.searchParams.get("provider");
  const provider =
    providerParam === "paystack" || providerParam === "flutterwave"
      ? (providerParam as PaymentProvider)
      : undefined;

  const processedParam = request.nextUrl.searchParams.get("processed");
  const processed =
    processedParam === "true" ? true : processedParam === "false" ? false : undefined;

  const events = await listAdminPaymentWebhookEvents({ provider, processed });
  return NextResponse.json({ role, events });
}
