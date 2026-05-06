import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import {
  CinematicHeroMedia,
  HeroStoryLightboxButton,
} from "@/components/media/cinematic-hero-media";
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
  { value: "Enquiry", label: "Direct contact follow-up" },
  { value: "Consistency", label: "Dependable manufacturing standards" },
];

export function HomeHeroSection({ page, banner }: HomeHeroSectionProps) {
  return (
    <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden bg-[color:var(--brand-2)]">
      <CinematicHeroMedia page={page} />
      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-7xl items-end px-4 py-10 md:px-6 md:py-14 lg:py-16">
        <FadeIn className="grid w-full gap-6 md:gap-7 lg:grid-cols-[minmax(0,1.02fr)_minmax(330px,0.78fr)] lg:items-end">
          <div className="max-w-3xl space-y-6 text-white">
            <div className="flex flex-wrap items-center gap-3">
              <p className="section-kicker text-[color:var(--brand-3)]">
                Premium Bread Production
              </p>
              <Badge>De-Nest Bread</Badge>
            </div>

            <BrandLogo href={null} tone="inverse" />

            <div className="space-y-3">
              <h1 className="hero-slogan display-heading text-4xl text-white sm:text-5xl lg:text-[4.35rem]">
                {page.headline}
              </h1>
              <p className="pretty-text max-w-2xl text-[0.98rem] leading-7 text-white/78 md:text-lg">
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
              <HeroStoryLightboxButton page={page} />
            </div>

            {banner ? (
              <div className="hidden rounded-[1.4rem] border border-white/12 bg-white/10 px-4 py-4 shadow-[0_18px_42px_rgba(0,0,0,0.16)] backdrop-blur md:block">
                <p className="section-kicker text-[color:var(--brand-3)]">{banner.label}</p>
                <p className="pretty-text mt-3 text-sm leading-7 text-white/78">
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

          <div className="rounded-[1.7rem] border border-white/12 bg-white/10 p-4 shadow-[0_24px_54px_rgba(0,0,0,0.18)] backdrop-blur">
            <div className="grid gap-2.5 sm:grid-cols-2">
              {heroMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[1.3rem] border border-white/12 bg-white/12 px-4 py-3.5 shadow-[0_12px_26px_rgba(0,0,0,0.1)]"
                >
                  <p className="display-heading text-[1.75rem] text-[color:var(--brand-3)]">
                    {metric.value}
                  </p>
                  <p className="mt-1.5 text-[11px] uppercase tracking-[0.14em] text-white/68">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
