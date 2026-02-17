import { NextRequest, NextResponse } from "next/server";

import { listOrdersByEmail } from "@/lib/commerce/service";
import { getCustomerSessionEmail } from "@/lib/customer/session";

export async function GET(request: NextRequest) {
  const email = getCustomerSessionEmail(request);
  if (!email) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const orders = await listOrdersByEmail(email);
  return NextResponse.json({ orders });
}
