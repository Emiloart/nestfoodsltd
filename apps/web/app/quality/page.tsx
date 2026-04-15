import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildPageMetadata } from "@/lib/seo/metadata";

const qualityPillars = [
  {
    title: "Production discipline",
    description:
      "Daily baking routines are managed for consistent crumb, slicing, and finished product quality.",
  },
  {
    title: "Hygienic handling",
    description:
      "Clean workflows, routine checks, and controlled handling standards guide the production environment.",
  },
  {
    title: "Packaging standards",
    description:
      "Finished bread lines are packed for dependable shelf presentation and downstream handling.",
  },
];

export const metadata = buildPageMetadata({
  title: "Quality Standards",
  description:
    "Learn how Nest Foods approaches production discipline, hygienic handling, and packaging standards across its bread range.",
  path: "/quality",
});

export default function QualityPage() {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 md:px-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
        <div className="section-frame px-5 py-7 sm:px-6 sm:py-8">
          <p className="section-kicker">Quality Standards</p>
          <h1 className="display-heading mt-4 text-4xl text-neutral-900 sm:text-5xl">
            Bread manufacturing standards built for consistency.
          </h1>
          <p className="pretty-text mt-4 max-w-3xl text-[0.98rem] leading-7 text-neutral-600">
            Nest Foods presents a simple public view of the standards behind its bread range:
            disciplined production, hygienic handling, and dependable packaging across daily
            operations.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/shop" className={buttonClassName({ variant: "secondary" })}>
              View Products
            </Link>
            <Link href="/contact" className={buttonClassName({ variant: "primary" })}>
              Contact Team
            </Link>
          </div>
        </div>

        <Card className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Public scope
          </p>
          <p className="text-sm text-neutral-700">
            This page summarizes quality expectations and production standards without exposing
            batch lookup, portal workflows, or operational tooling.
          </p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {qualityPillars.map((pillar) => (
          <Card key={pillar.title} className="space-y-3">
            <p className="section-kicker">{pillar.title}</p>
            <p className="pretty-text text-sm leading-7 text-neutral-700">{pillar.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
