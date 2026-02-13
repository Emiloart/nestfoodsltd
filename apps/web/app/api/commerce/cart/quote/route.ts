import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { quoteCart } from "@/lib/commerce/service";

const quoteSchema = z.object({
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
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const validated = quoteSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: "Invalid quote payload", details: validated.error.flatten() }, { status: 400 });
  }

  const quote = await quoteCart(validated.data);
  return NextResponse.json({ quote });
}
