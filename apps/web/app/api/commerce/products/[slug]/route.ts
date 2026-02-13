import { NextRequest, NextResponse } from "next/server";

import { getCommerceProductBySlug } from "@/lib/commerce/service";

type RouteContext = {
  params: Promise<{ slug: string }> | { slug: string };
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { slug } = await Promise.resolve(context.params);
  const product = await getCommerceProductBySlug(slug);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}
