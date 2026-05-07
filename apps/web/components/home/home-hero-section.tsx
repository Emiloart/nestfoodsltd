import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import {
  CinematicHeroMedia,
  HeroStoryLightboxButton,
} from "@/components/media/cinematic-hero-media";
import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { type CmsPage } from "@/lib/cms/types";

type HomeHeroSectionProps = {
  page: CmsPage;
};

export function HomeHeroSection({ page }: HomeHeroSectionProps) {
  return (
    <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden bg-[color:var(--brand-2)]">
      <CinematicHeroMedia page={page} />
      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-7xl items-end px-4 py-10 md:px-6 md:py-14 lg:py-16">
        <FadeIn className="grid w-full gap-6 md:gap-7 lg:grid-cols-[minmax(0,1fr)] lg:items-end">
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
              <HeroStoryLightboxButton page={page} />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
