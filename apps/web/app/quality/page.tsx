import { permanentRedirect } from "next/navigation";

import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Production Standards",
  description:
    "Legacy route redirected to the production standards section on the Nest Foods homepage.",
  path: "/quality",
  noIndex: true,
});

export default function QualityPage() {
  permanentRedirect("/#production-standards");
}
