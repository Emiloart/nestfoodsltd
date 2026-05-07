import { PageShell } from "@/components/page-shell";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Terms of Use",
  description: "Terms covering website use, product information, and enquiries.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <PageShell
      title="Terms of Use"
      description="Terms covering website use, intellectual property, and enquiry-related communication for Nest Foods Limited."
    />
  );
}
