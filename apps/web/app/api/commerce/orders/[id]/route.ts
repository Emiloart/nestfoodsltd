import { NextRequest, NextResponse } from "next/server";

import { getOrderById } from "@/lib/commerce/service";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await Promise.resolve(context.params);
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  return NextResponse.json({ order });
}
