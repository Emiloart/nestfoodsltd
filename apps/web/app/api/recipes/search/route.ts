import { NextRequest, NextResponse } from "next/server";

import { searchRecipes } from "@/lib/recipes/service";

export async function GET(request: NextRequest) {
  const ingredients = request.nextUrl.searchParams.get("ingredients") ?? undefined;
  const search = request.nextUrl.searchParams.get("search") ?? undefined;

  const recipes = await searchRecipes({
    ingredients,
    search,
  });

  return NextResponse.json({ recipes });
}
