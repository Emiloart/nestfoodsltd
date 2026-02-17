import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCommerceProductBySlug } from "@/lib/commerce/service";
import { getCustomerSessionEmail } from "@/lib/customer/session";
import { listCustomerRecentlyViewedSlugs, trackCustomerRecentlyViewed } from "@/lib/customer/service";

const recentlyViewedSchema = z.object({
  productSlug: z.string().trim().min(3).max(140),
});

async function mapRecentlyViewed(slugs: string[]) {
  const products = await Promise.all(slugs.map(async (slug) => getCommerceProductBySlug(slug)));
  return products
    .filter((product): product is NonNullable<typeof product> => Boolean(product))
    .map((product) => ({
      slug: product.slug,
      name: product.name,
      category: product.category,
      imageUrl: product.imageUrl,
      shortDescription: product.shortDescription,
    }));
}

export async function GET(request: NextRequest) {
  const email = getCustomerSessionEmail(request);
  if (!email) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const slugs = await listCustomerRecentlyViewedSlugs(email, 10);
  const recentlyViewed = await mapRecentlyViewed(slugs);
  return NextResponse.json({ recentlyViewed });
}

export async function POST(request: NextRequest) {
  const email = getCustomerSessionEmail(request);
  if (!email) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validated = recentlyViewedSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: "Invalid recently-viewed payload", details: validated.error.flatten() },
      { status: 400 },
    );
  }

  const product = await getCommerceProductBySlug(validated.data.productSlug);
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  await trackCustomerRecentlyViewed(email, product.slug);
  const slugs = await listCustomerRecentlyViewedSlugs(email, 10);
  const recentlyViewed = await mapRecentlyViewed(slugs);
  return NextResponse.json({ recentlyViewed }, { status: 201 });
}
