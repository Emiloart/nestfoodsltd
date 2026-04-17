import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { HeroMedia } from "@/components/media/hero-media";
import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { type CmsBanner, type CmsPage } from "@/lib/cms/types";

type HomeHeroSectionProps = {
  page: CmsPage;
  banner?: CmsBanner;
};

const heroMetrics = [
  { value: "Quality", label: "Daily product assurance checks" },
  { value: "Hygiene", label: "Controlled production routines" },
  { value: "Support", label: "Direct enquiry follow-up" },
  { value: "Consistency", label: "Dependable manufacturing standards" },
];

export function HomeHeroSection({ page, banner }: HomeHeroSectionProps) {
  return (
    <section className="hero-ripple mx-auto w-full max-w-7xl px-4 pb-7 pt-6 md:px-6 md:pb-10 md:pt-9 lg:pb-12 lg:pt-10">
      <FadeIn className="grid gap-6 md:gap-7 lg:grid-cols-[minmax(0,1.02fr)_minmax(360px,0.98fr)] lg:items-end">
        <div className="max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <p className="section-kicker">Premium Bread Production</p>
            <Badge>Manufacturer-first</Badge>
          </div>

          <BrandLogo href={null} />

          <div className="space-y-3">
                <h1 className="display-heading text-4xl text-[color:var(--foreground)] sm:text-5xl lg:text-[3.75rem]">
                  {page.headline}
                </h1>
                <p className="pretty-text max-w-2xl text-[0.98rem] leading-7 text-[color:var(--muted-foreground)] md:text-lg">
                  {page.description}
                </p>
              </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={page.ctaPrimaryHref ?? "/shop"}
              className={buttonClassName({ variant: "primary" })}
            >
              {page.ctaPrimaryLabel ?? "Explore Products"}
            </Link>
            <Link
              href={page.ctaSecondaryHref ?? "/contact"}
              className={buttonClassName({ variant: "secondary" })}
            >
              {page.ctaSecondaryLabel ?? "Contact Team"}
            </Link>
          </div>

          {banner ? (
            <div className="section-frame hidden bg-[color:var(--surface-strong)] px-4 py-4 md:block">
              <p className="section-kicker">{banner.label}</p>
              <p className="pretty-text mt-3 text-sm leading-7 text-[color:var(--foreground)]/78">
                {banner.headline}
              </p>
              {banner.ctaLabel && banner.ctaHref ? (
                <Link
                  href={banner.ctaHref}
                  className={buttonClassName({
                    variant: "secondary",
                    size: "sm",
                    className: "mt-4",
                  })}
                >
                  {banner.ctaLabel}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="section-frame bg-[color:var(--surface-elevated)] p-4 sm:p-5">
          <HeroMedia page={page} />

          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {heroMetrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-[1.3rem] border border-[color:var(--border-strong)] bg-[color:var(--surface-strong)] px-4 py-3.5 shadow-[0_12px_26px_rgba(46,18,69,0.08)]"
              >
                <p className="display-heading text-[1.75rem] text-[color:var(--brand-1)]">
                  {metric.value}
                </p>
                <p className="mt-1.5 text-[11px] uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
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
