import Link from "next/link";

import { MobileAutoCarousel } from "@/components/home/mobile-auto-carousel";
import { Card } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { SectionHeading } from "@/components/home/section-heading";
import { type CmsPage } from "@/lib/cms/types";

type HomeStorySectionProps = {
  aboutPage: CmsPage;
  visionPage: CmsPage;
};

function StoryCard({ page }: { page: CmsPage }) {
  return (
    <Card className="space-y-4">
      <div>
        <p className="section-kicker">{page.title}</p>
        <h3 className="mt-3 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          {page.headline}
        </h3>
        <p className="pretty-text mt-4 line-clamp-4 text-sm leading-7 text-neutral-600 dark:text-neutral-300 md:line-clamp-none">
          {page.description}
        </p>
      </div>
      <Link
        href={`/${page.slug}`}
        className={buttonClassName({ variant: "secondary", size: "sm" })}
      >
        Explore {page.title}
      </Link>
    </Card>
  );
}

export function HomeStorySection({ aboutPage, visionPage }: HomeStorySectionProps) {
  const pages = [aboutPage, visionPage];

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 lg:py-9">
      <SectionHeading
        eyebrow="About Nest Foods"
        title="Company story, mission, and direction."
        description="Learn how Nest Foods presents its manufacturing credibility and long-term vision."
        descriptionClassName="hidden md:block"
      />

      <MobileAutoCarousel
        ariaLabel="About and vision"
        className="mt-5"
        intervalMs={3000}
        items={pages.map((page) => (
          <StoryCard key={page.slug} page={page} />
        ))}
      />

      <div className="mt-5 hidden gap-4 md:grid lg:grid-cols-2">
        {pages.map((page) => (
          <StoryCard key={page.slug} page={page} />
        ))}
      </div>
    </section>
  );
}
