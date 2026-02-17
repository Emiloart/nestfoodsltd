import { NextRequest, NextResponse } from "next/server";

import { listCommerceFacets, listCommerceProducts } from "@/lib/commerce/service";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") ?? undefined;
  const category = request.nextUrl.searchParams.get("category") ?? undefined;
  const allergenExclude = request.nextUrl.searchParams.get("allergenExclude") ?? undefined;
  const tag = request.nextUrl.searchParams.get("tag") ?? undefined;
  const inStockOnly = request.nextUrl.searchParams.get("inStockOnly") === "1";
  const sortParam = request.nextUrl.searchParams.get("sort");
  const sort = sortParam === "price_asc" || sortParam === "price_desc" ? sortParam : undefined;

  const [products, facets] = await Promise.all([
    listCommerceProducts({ search, category, allergenExclude, tag, inStockOnly, sort }),
    listCommerceFacets(),
  ]);

  return NextResponse.json({ products, facets });
}
