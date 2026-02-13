import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createOrder, createPaymentSession } from "@/lib/commerce/service";

const checkoutSchema = z.object({
  customerEmail: z.string().trim().email(),
  customerName: z.string().trim().max(120).optional(),
  shippingAddress: z.string().trim().min(8).max(300),
  notes: z.string().trim().max(500).optional(),
  items: z
    .array(
      z.object({
        variantId: z.string().trim().min(3),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1),
  promoCode: z.string().trim().max(30).optional(),
  deliverySlotId: z.string().trim().max(100).optional(),
  paymentProvider: z.enum(["paystack", "flutterwave"]),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const validated = checkoutSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: "Invalid checkout payload", details: validated.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const order = await createOrder(validated.data);
    const payment = await createPaymentSession(order.id, validated.data.paymentProvider);
    return NextResponse.json({ order, payment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout creation failed." },
      { status: 400 },
    );
  }
}
