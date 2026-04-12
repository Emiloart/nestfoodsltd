import { redirect } from "next/navigation";

import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Account Closed",
  description: "Nest Foods no longer exposes a public customer account flow.",
  path: "/account",
  noIndex: true,
});

export default function AccountPage() {
  redirect("/contact");
}
