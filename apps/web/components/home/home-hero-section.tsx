import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { type CmsBanner, type CmsPage } from "@/lib/cms/types";

type HomeHeroSectionProps = {
  page: CmsPage;
  banner?: CmsBanner;
};

const heroMetrics = [
  { value: "24h", label: "Quality review cycle" },
  { value: "4", label: "Supply regions in seed catalog" },
  { value: "B2B", label: "Approved partner pathway" },
];

export function HomeHeroSection({ page, banner }: HomeHeroSectionProps) {
  return (
    <section className="hero-ripple mx-auto w-full max-w-7xl px-4 pb-8 pt-8 md:px-6 md:pb-12 md:pt-12">
      <FadeIn className="grid gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(360px,0.98fr)] lg:items-end">
        <div className="max-w-3xl space-y-7">
          <div className="flex flex-wrap items-center gap-3">
            <p className="section-kicker">Premium Bread Production</p>
            <Badge>Manufacturing credibility first</Badge>
          </div>

          <BrandLogo href={null} />

          <div className="space-y-4">
            <h1 className="display-heading text-5xl text-neutral-900 dark:text-neutral-50 sm:text-6xl lg:text-7xl">
              {page.headline}
            </h1>
            <p className="pretty-text max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-300 md:text-lg md:leading-8">
              {page.description}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={page.ctaPrimaryHref ?? "/shop"}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--brand-1),var(--brand-2))] px-6 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:brightness-105"
            >
              {page.ctaPrimaryLabel ?? "Explore Products"}
            </Link>
            <Link
              href={page.ctaSecondaryHref ?? "/traceability"}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-6 text-sm font-medium text-neutral-900 transition hover:-translate-y-0.5 hover:brightness-105 dark:text-neutral-100"
            >
              {page.ctaSecondaryLabel ?? "Our Standards"}
            </Link>
          </div>

          {banner ? (
            <div className="section-frame hidden px-5 py-5 md:block">
              <p className="section-kicker">{banner.label}</p>
              <p className="pretty-text mt-3 text-sm leading-7 text-neutral-700 dark:text-neutral-200">
                {banner.headline}
              </p>
              {banner.ctaLabel && banner.ctaHref ? (
                <Link
                  href={banner.ctaHref}
                  className="mt-4 inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-neutral-900 transition hover:-translate-y-0.5 hover:brightness-105 dark:text-neutral-100"
                >
                  {banner.ctaLabel}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="section-frame p-4 sm:p-5 lg:p-6">
          <ImagePlaceholder
            src={page.heroImageUrl ?? "/placeholders/hero-image-placeholder.svg"}
            alt="Nest Foods production placeholder"
            label="Production Visual Placeholder"
            className="aspect-[6/5] sm:aspect-[5/4] lg:aspect-[4/5]"
            priority
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {heroMetrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-[1.3rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-4"
              >
                <p className="display-heading text-3xl text-neutral-900 dark:text-neutral-100">
                  {metric.value}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
