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

            <div className="relative mx-auto flex min-h-[18rem] w-full max-w-7xl items-end px-4 py-6 md:min-h-[24rem] md:px-6 md:py-8">
              <div className="flex w-full flex-col gap-4 rounded-3xl border border-white/15 bg-[rgba(46,18,69,0.9)] p-4 text-white shadow-2xl md:flex-row md:items-center md:justify-between md:p-5">
                <div className="max-w-2xl">
                  <p className="font-montserrat text-xs font-black uppercase tracking-[0.26em] text-[color:var(--brand-3)]">
                    {banner.label}
                  </p>
                  <h2 className="mt-2 font-playfair text-2xl font-bold leading-tight text-white md:text-4xl">
                    {banner.headline}
                  </h2>
                </div>
                {banner.ctaHref && banner.ctaLabel ? (
                  isInternalHref(banner.ctaHref) ? (
                    <Link
                      href={banner.ctaHref}
                      className={buttonClassName({
                        size: "sm",
                        className: "self-end whitespace-nowrap border-transparent md:self-center",
                      })}
                    >
                      {banner.ctaLabel}
                    </Link>
                  ) : (
                    <a
                      href={banner.ctaHref}
                      className={buttonClassName({
                        size: "sm",
                        className: "self-end whitespace-nowrap border-transparent md:self-center",
                      })}
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
