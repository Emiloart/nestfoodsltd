import { TraceabilityPageClient } from "@/components/traceability/traceability-page-client";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Traceability",
  description:
    "Verify product batch journey details including sourcing, processing, and certifications.",
  path: "/traceability",
});

export default function TraceabilityPage() {
  return <TraceabilityPageClient />;
}
