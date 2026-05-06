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

const milestones = [
  "Incorporated in 2022 by Mr. Obinna Paulinus Nwosu.",
  "Launched De-Nest family bread for everyday Nigerian households.",
  "Expanded production routines, packaging discipline, and market awareness.",
  "Continues building a trusted national bakery brand from Awka, Anambra State.",
];

const whyDeNest = [
  "Soft bread products for family meals, school lunch, travel, and daily sharing.",
  "A manufacturing story built around hygiene, ingredient clarity, and dependable quality.",
  "A Nigerian bakery brand with contact locations and direct enquiry routes for follow-up.",
];

function StoryCard({ page }: { page: CmsPage }) {
  return (
    <Card className="space-y-4">
      <div>
        <p className="section-kicker">{page.title}</p>
        <h3 className="mt-3 text-2xl font-semibold text-neutral-900">{page.headline}</h3>
        <p className="pretty-text mt-4 line-clamp-4 text-sm leading-7 text-neutral-600 md:line-clamp-none">
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
        eyebrow="About & Vision"
        title="The company story and long-term direction."
        description="Learn how Nest Foods Limited presents its manufacturing values and growth ambition."
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

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
        <Card className="space-y-4">
          <p className="section-kicker">Founder Story</p>
          <h3 className="text-2xl font-semibold text-neutral-900">
            Mr. Obinna Paulinus Nwosu
          </h3>
          <p className="pretty-text text-sm leading-7 text-neutral-600">
            The founder established Nest Foods Limited with the goal of building a dependable
            bread manufacturer focused on quality, affordability, service excellence, employment
            creation, and local economic development.
          </p>
          <Link href="/about" className={buttonClassName({ variant: "secondary", size: "sm" })}>
            Read About Nest Foods Limited
          </Link>
        </Card>

        <div className="grid gap-4">
          <Card className="space-y-4">
            <p className="section-kicker">Milestones</p>
            <div className="space-y-3">
              {milestones.map((item, index) => (
                <div
                  key={item}
                  className="grid gap-3 rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 sm:grid-cols-[3rem_1fr]"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--brand-1)] text-xs font-black text-white">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-7 text-neutral-700">{item}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <p className="section-kicker">Why De-Nest?</p>
            <div className="grid gap-3 md:grid-cols-3">
              {whyDeNest.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4"
                >
                  <p className="text-sm leading-7 text-neutral-700">{item}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
