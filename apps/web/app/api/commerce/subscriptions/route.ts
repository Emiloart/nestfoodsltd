import { NextRequest, NextResponse } from "next/server";

import { listSubscriptionsByEmail } from "@/lib/commerce/service";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email") ?? undefined;
  const subscriptions = await listSubscriptionsByEmail(email);
  return NextResponse.json({ subscriptions });
}
