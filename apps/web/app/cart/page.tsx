import { redirect } from "next/navigation";

import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Cart Closed",
  description: "Nest Foods no longer exposes a public cart flow.",
  path: "/cart",
  noIndex: true,
});

export default function CartPage() {
  redirect("/contact");
}
