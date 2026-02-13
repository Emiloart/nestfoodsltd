import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createPaymentSession } from "@/lib/commerce/service";

const schema = z.object({
  orderId: z.string().trim().min(8),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const validated = schema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const session = await createPaymentSession(validated.data.orderId, "flutterwave");
    return NextResponse.json({ session });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create session." }, { status: 400 });
  }
}
