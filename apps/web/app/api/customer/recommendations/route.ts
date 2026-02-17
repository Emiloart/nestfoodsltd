import { NextRequest, NextResponse } from "next/server";

import { getCommerceProductBySlug } from "@/lib/commerce/service";
import { getCustomerSessionEmail } from "@/lib/customer/session";
import { getCustomerRecommendations } from "@/lib/customer/service";

export async function GET(request: NextRequest) {
  const email = getCustomerSessionEmail(request) ?? undefined;
  const recommendations = await getCustomerRecommendations(email);

  const hydrated = await Promise.all(
    recommendations.map(async (entry) => {
      const product = await getCommerceProductBySlug(entry.productSlug);
      if (!product) {
        return null;
      }
      return {
        id: entry.id,
        type: entry.type,
        reason: entry.reason,
        product: {
          slug: product.slug,
          name: product.name,
          category: product.category,
          imageUrl: product.imageUrl,
        },
      };
    }),
  );

  return NextResponse.json({
    recommendations: hydrated.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
  });
}
