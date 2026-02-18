import { CheckoutPageClient } from "@/components/cart/checkout-page-client";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Checkout",
  description: "Secure checkout flow with payment provider selection and order confirmation.",
  path: "/checkout",
  noIndex: true,
});

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
