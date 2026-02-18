import { B2BPageClient } from "@/components/b2b/b2b-page-client";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Distributor Portal",
  description:
    "B2B ordering portal for approved distributors with tiered pricing, quote requests, and account management.",
  path: "/b2b",
});

export default function B2BPage() {
  return <B2BPageClient />;
}
