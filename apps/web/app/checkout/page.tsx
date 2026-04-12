import { redirect } from "next/navigation";

import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Checkout Closed",
  description: "Nest Foods no longer exposes a public checkout flow.",
  path: "/checkout",
  noIndex: true,
});

export default function CheckoutPage() {
  redirect("/contact");
}
