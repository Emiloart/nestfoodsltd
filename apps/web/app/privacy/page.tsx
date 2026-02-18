import { PrivacyPageClient } from "@/components/privacy/privacy-page-client";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Privacy Center",
  description:
    "Manage consent preferences and submit NDPR data-access or data-deletion requests for your Nest Foods profile.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}
