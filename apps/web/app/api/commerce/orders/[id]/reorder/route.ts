import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { reorderOrder } from "@/lib/commerce/service";

const schema = z.object({
  customerEmail: z.string().trim().email(),
  paymentProvider: z.enum(["paystack", "flutterwave"]).default("paystack"),
});

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function POST(request: NextRequest, context: RouteContext) {
  const body = await request.json().catch(() => null);
  const validated = schema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: "Invalid reorder payload.", details: validated.error.flatten() }, { status: 400 });
  }

  const { id } = await Promise.resolve(context.params);
  try {
    const order = await reorderOrder(id, validated.data.customerEmail, validated.data.paymentProvider);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to reorder." }, { status: 400 });
  }
}
