import { NextResponse } from "next/server";

import { listRecipeIngredients } from "@/lib/recipes/service";

export async function GET() {
  const ingredients = await listRecipeIngredients();
  return NextResponse.json({ ingredients });
}
