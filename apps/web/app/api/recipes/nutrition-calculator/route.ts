import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { calculateRecipeNutritionBundle } from "@/lib/recipes/service";

const calculatorSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().trim().min(3),
        quantity: z.number().int().min(1).max(500),
      }),
    )
    .min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const validated = calculatorSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: "Invalid calculator payload.", details: validated.error.flatten() },
      { status: 400 },
    );
  }

  const result = await calculateRecipeNutritionBundle(validated.data.items);
  return NextResponse.json(result);
}
