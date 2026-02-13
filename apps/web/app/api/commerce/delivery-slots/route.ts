import { NextResponse } from "next/server";

import { listDeliverySlots } from "@/lib/commerce/service";

export async function GET() {
  const deliverySlots = await listDeliverySlots();
  return NextResponse.json({ deliverySlots });
}
