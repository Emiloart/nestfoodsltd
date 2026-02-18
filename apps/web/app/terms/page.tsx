import { PageShell } from "@/components/page-shell";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Terms of Service",
  description:
    "Terms covering commerce purchases, delivery policies, subscriptions, and B2B agreements.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <PageShell
      title="Terms of Service"
      description="Scaffold for sales terms, delivery policy, subscription terms, and B2B clauses."
      nextStep="Attach legal templates + versioned publishing"
    />
  );
}
