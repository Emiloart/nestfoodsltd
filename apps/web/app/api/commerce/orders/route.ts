import { NextRequest, NextResponse } from "next/server";

import { listOrdersByEmail } from "@/lib/commerce/service";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email") ?? undefined;
  const orders = await listOrdersByEmail(email);
  return NextResponse.json({ orders });
}
