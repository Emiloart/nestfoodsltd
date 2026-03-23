import Link from "next/link";

import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/home/section-heading";
import { type CmsPage } from "@/lib/cms/types";

type HomeStorySectionProps = {
  aboutPage: CmsPage;
  visionPage: CmsPage;
};

export function HomeStorySection({ aboutPage, visionPage }: HomeStorySectionProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <SectionHeading
        eyebrow="About & Vision"
        title="Corporate storytelling should support trust, not crowd out the product and quality narrative."
        description="These CMS-driven sections remain flexible, but they now sit behind product and traceability instead of competing with them."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {[aboutPage, visionPage].map((page) => (
          <Card key={page.slug} className="space-y-5">
            <div>
              <p className="section-kicker">{page.title}</p>
              <h3 className="mt-3 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                {page.headline}
              </h3>
              <p className="pretty-text mt-4 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                {page.description}
              </p>
            </div>
            <Link
              href={`/${page.slug}`}
              className="inline-flex rounded-full border border-[color:var(--border)] px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-neutral-900 transition hover:-translate-y-0.5 hover:bg-[color:var(--surface-strong)] dark:text-neutral-100"
            >
              Explore {page.title}
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}
