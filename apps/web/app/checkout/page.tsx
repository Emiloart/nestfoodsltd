import { CheckoutPageClient } from "@/components/cart/checkout-page-client";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Bulk Checkout",
  description: "Bulk checkout flow with delivery-slot region validation and payment selection.",
  path: "/checkout",
  noIndex: true,
});

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
