import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";
import { type CmsBanner } from "@/lib/cms/types";

function isInternalHref(href: string) {
  return href.startsWith("/");
}

function getDesktopBannerImageUrl(banner: CmsBanner) {
  return banner.desktopImageUrl ?? banner.imageUrl;
}

function getMobileBannerImageUrl(banner: CmsBanner) {
  return banner.mobileImageUrl ?? getDesktopBannerImageUrl(banner);
}

export function HomeBannerSection({ banners }: { banners: CmsBanner[] }) {
  if (banners.length === 0) {
    return null;
  }

  return (
    <section aria-label="Featured De-Nest Bread updates" className="w-full py-0">
      <div className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {banners.map((banner, index) => {
          const desktopImageUrl = getDesktopBannerImageUrl(banner);
          const mobileImageUrl = getMobileBannerImageUrl(banner);

          return (
            <article
              key={banner.id}
              aria-label={banner.label}
              className="relative min-w-full snap-center overflow-hidden bg-[color:var(--brand-2)]"
            >
              <picture>
                <source media="(max-width: 767px)" srcSet={mobileImageUrl} />
                <img
                  src={desktopImageUrl}
                  alt={banner.label}
                  loading={index === 0 ? "eager" : "lazy"}
                  className="h-auto w-full object-contain"
                />
              </picture>

              {banner.ctaHref && banner.ctaLabel ? (
                <div className="absolute inset-x-0 bottom-0 z-10 flex w-full justify-end px-4 pb-4 md:px-6 md:pb-5">
                  {isInternalHref(banner.ctaHref) ? (
                    <Link
                      href={banner.ctaHref}
                      className={buttonClassName({
                        size: "sm",
                        className:
                          "whitespace-nowrap border-transparent shadow-[0_14px_28px_rgba(46,18,69,0.24)]",
                      })}
                    >
                      {banner.ctaLabel}
                    </Link>
                  ) : (
                    <a
                      href={banner.ctaHref}
                      className={buttonClassName({
                        size: "sm",
                        className:
                          "whitespace-nowrap border-transparent shadow-[0_14px_28px_rgba(46,18,69,0.24)]",
                      })}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {banner.ctaLabel}
                    </a>
                  )}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
