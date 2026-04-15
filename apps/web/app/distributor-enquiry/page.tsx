import { DistributorEnquiryPageClient } from "@/components/distributor/distributor-enquiry-page-client";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Distributor Enquiry",
  description:
    "Public distributor enquiry route for product introductions, regional coverage discussions, and partner follow-up.",
  path: "/distributor-enquiry",
  noIndex: true,
});

export default function DistributorEnquiryPage() {
  return <DistributorEnquiryPageClient />;
}
