import { B2BPageClient } from "@/components/b2b/b2b-page-client";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Distributor Portal",
  description:
    "Approved partner portal for distributor sign-in, quote requests, order visibility, and support.",
  path: "/b2b",
  noIndex: true,
});

export default function B2BPage() {
  return <B2BPageClient />;
}
