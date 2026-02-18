import { AccountPageClient } from "@/components/account/account-page-client";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Account",
  description: "Manage profile, addresses, preferences, and order history.",
  path: "/account",
  noIndex: true,
});

export default function AccountPage() {
  return <AccountPageClient />;
}
