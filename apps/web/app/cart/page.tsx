import { CartPageClient } from "@/components/cart/cart-page-client";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Cart",
  description: "Review selected products, delivery slot, and subtotal before checkout.",
  path: "/cart",
  noIndex: true,
});

export default function CartPage() {
  return <CartPageClient />;
}
