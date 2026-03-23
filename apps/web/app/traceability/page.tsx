import { TraceabilityPageClient } from "@/components/traceability/traceability-page-client";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Quality & Traceability",
  description:
    "Verify Nest Foods bread batch history across sourcing, production, packaging, and certification checkpoints.",
  path: "/traceability",
});

export default function TraceabilityPage() {
  return <TraceabilityPageClient />;
}
