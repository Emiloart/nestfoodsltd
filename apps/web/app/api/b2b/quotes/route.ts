import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getB2BSessionAccountId } from "@/lib/b2b/session";
import { createB2BQuoteRequest, listB2BQuoteRequests } from "@/lib/b2b/service";

const quoteSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().trim().min(3),
        quantity: z.number().int().min(1).max(10000),
      }),
    )
    .min(1),
  notes: z.string().trim().max(500).optional(),
  preferredDeliveryDate: z.string().trim().max(50).optional(),
});

export async function GET(request: NextRequest) {
  const accountId = getB2BSessionAccountId(request);
  if (!accountId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const quoteRequests = await listB2BQuoteRequests(accountId);
  return NextResponse.json({ quoteRequests });
}

export async function POST(request: NextRequest) {
  const accountId = getB2BSessionAccountId(request);
  if (!accountId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validated = quoteSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: "Invalid quote payload", details: validated.error.flatten() }, { status: 400 });
  }

  try {
    const quoteRequest = await createB2BQuoteRequest(accountId, validated.data);
    return NextResponse.json({ quoteRequest }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create quote request." }, { status: 400 });
  }
}
