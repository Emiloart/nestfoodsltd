import { PageShell } from "@/components/page-shell";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Terms of Service",
  description:
    "Terms covering website use, product information, enquiries, and partner communications.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <PageShell
      title="Terms of Service"
      description="Scaffold for website terms, product information disclaimers, and enquiry handling policies."
      nextStep="Attach legal templates + versioned publishing"
    />
  );
}
