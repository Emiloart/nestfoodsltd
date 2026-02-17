import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getB2BSessionAccountId } from "@/lib/b2b/session";
import { buildB2BQuote } from "@/lib/b2b/service";

const previewSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().trim().min(3),
        quantity: z.number().int().min(1).max(10000),
      }),
    )
    .min(1),
});

export async function POST(request: NextRequest) {
  const accountId = getB2BSessionAccountId(request);
  if (!accountId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validated = previewSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: "Invalid quote preview payload", details: validated.error.flatten() }, { status: 400 });
  }

  try {
    const preview = await buildB2BQuote(accountId, validated.data.items);
    return NextResponse.json({ preview });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to build quote preview." }, { status: 400 });
  }
}
