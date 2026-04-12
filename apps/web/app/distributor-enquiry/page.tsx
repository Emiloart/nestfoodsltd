import { DistributorEnquiryPageClient } from "@/components/distributor/distributor-enquiry-page-client";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Distributor Enquiry",
  description:
    "Public distributor enquiry route for regional supply discussions, expected volume planning, and partner follow-up.",
  path: "/distributor-enquiry",
});

export default function DistributorEnquiryPage() {
  return <DistributorEnquiryPageClient />;
}
