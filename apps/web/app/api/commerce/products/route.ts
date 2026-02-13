import { NextRequest, NextResponse } from "next/server";

import { listCommerceCategories, listCommerceProducts } from "@/lib/commerce/service";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") ?? undefined;
  const category = request.nextUrl.searchParams.get("category") ?? undefined;
  const allergenExclude = request.nextUrl.searchParams.get("allergenExclude") ?? undefined;

  const [products, categories] = await Promise.all([
    listCommerceProducts({ search, category, allergenExclude }),
    listCommerceCategories(),
  ]);

  return NextResponse.json({ products, categories });
}
