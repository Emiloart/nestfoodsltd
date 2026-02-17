import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getOrderById, reorderOrder } from "@/lib/commerce/service";
import { getCustomerSessionEmail } from "@/lib/customer/session";

const reorderSchema = z.object({
  paymentProvider: z.enum(["paystack", "flutterwave"]).default("paystack"),
});

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function POST(request: NextRequest, context: RouteContext) {
  const email = getCustomerSessionEmail(request);
  if (!email) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { id } = await Promise.resolve(context.params);
  const existingOrder = await getOrderById(id);
  if (!existingOrder || existingOrder.customerEmail !== email) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const validated = reorderSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: "Invalid reorder payload.", details: validated.error.flatten() }, { status: 400 });
  }

  try {
    const order = await reorderOrder(id, email, validated.data.paymentProvider);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to reorder." }, { status: 400 });
  }
}
