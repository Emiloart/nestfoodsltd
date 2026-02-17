import { NextRequest, NextResponse } from "next/server";

import { listSubscriptionsByEmail } from "@/lib/commerce/service";
import { getCustomerSessionEmail } from "@/lib/customer/session";

export async function GET(request: NextRequest) {
  const email = getCustomerSessionEmail(request);
  if (!email) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const subscriptions = await listSubscriptionsByEmail(email);
  return NextResponse.json({ subscriptions });
}
