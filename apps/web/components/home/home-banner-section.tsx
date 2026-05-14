import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";
import { type CmsBanner } from "@/lib/cms/types";

function isInternalHref(href: string) {
  return href.startsWith("/");
}

export function HomeBannerSection({ banners }: { banners: CmsBanner[] }) {
  if (banners.length === 0) {
    return null;
  }

  return (
    <section aria-label="Featured De-Nest Bread updates" className="w-full py-4 md:py-6">
      <div className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {banners.map((banner, index) => (
          <article
            key={banner.id}
            aria-label={banner.label}
            className="relative min-h-[18rem] min-w-full snap-center overflow-hidden bg-[color:var(--brand-2)] md:min-h-[24rem]"
          >
            <img
              src={banner.imageUrl}
              alt={banner.label}
              loading={index === 0 ? "eager" : "lazy"}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(46,18,69,0.88),rgba(46,18,69,0.48),rgba(46,18,69,0.12))]" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(0deg,var(--surface),rgba(245,239,230,0))]" />

            <div className="relative mx-auto flex min-h-[18rem] w-full max-w-7xl items-center px-4 py-10 md:min-h-[24rem] md:px-6">
              <div className="max-w-2xl text-white">
                <p className="font-montserrat text-xs font-black uppercase tracking-[0.26em] text-[color:var(--brand-3)]">
                  De-Nest Bread
                </p>
                <h2 className="mt-3 font-playfair text-3xl font-bold leading-tight text-white md:text-5xl">
                  {banner.headline}
                </h2>
                {banner.ctaHref && banner.ctaLabel ? (
                  isInternalHref(banner.ctaHref) ? (
                    <Link
                      href={banner.ctaHref}
                      className={buttonClassName({ className: "mt-6 border-transparent" })}
                    >
                      {banner.ctaLabel}
                    </Link>
                  ) : (
                    <a
                      href={banner.ctaHref}
                      className={buttonClassName({ className: "mt-6 border-transparent" })}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {banner.ctaLabel}
                    </a>
                  )
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
