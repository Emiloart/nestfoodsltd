import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCommerceProductBySlug, listCommerceProducts } from "@/lib/commerce/service";
import { getCustomerSessionEmail } from "@/lib/customer/session";
import { addToCustomerWishlist, listCustomerWishlistSlugs, removeFromCustomerWishlist } from "@/lib/customer/service";

const wishlistMutationSchema = z.object({
  productSlug: z.string().trim().min(3).max(140),
});

async function mapWishlistProducts(slugs: string[]) {
  if (slugs.length === 0) {
    return [];
  }

  const products = await listCommerceProducts();
  const productBySlug = new Map(products.map((entry) => [entry.slug, entry]));
  return slugs.map((slug) => productBySlug.get(slug)).filter((entry): entry is (typeof products)[number] => Boolean(entry));
}

export async function GET(request: NextRequest) {
  const email = getCustomerSessionEmail(request);
  if (!email) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const slugs = await listCustomerWishlistSlugs(email);
  const wishlist = await mapWishlistProducts(slugs);
  return NextResponse.json({ slugs, wishlist });
}

export async function POST(request: NextRequest) {
  const email = getCustomerSessionEmail(request);
  if (!email) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validated = wishlistMutationSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: "Invalid wishlist payload.", details: validated.error.flatten() }, { status: 400 });
  }

  const product = await getCommerceProductBySlug(validated.data.productSlug);
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const slugs = await addToCustomerWishlist(email, product.slug);
  const wishlist = await mapWishlistProducts(slugs);
  return NextResponse.json({ slugs, wishlist }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const email = getCustomerSessionEmail(request);
  if (!email) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validated = wishlistMutationSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: "Invalid wishlist payload.", details: validated.error.flatten() }, { status: 400 });
  }

  const slugs = await removeFromCustomerWishlist(email, validated.data.productSlug);
  const wishlist = await mapWishlistProducts(slugs);
  return NextResponse.json({ slugs, wishlist });
}
