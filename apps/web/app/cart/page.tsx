import { CartPageClient } from "@/components/cart/cart-page-client";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Bulk Cart",
  description: "Review bulk quantities, availability constraints, and totals before checkout.",
  path: "/cart",
  noIndex: true,
});

export default function CartPage() {
  return <CartPageClient />;
}
