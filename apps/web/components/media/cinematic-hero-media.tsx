"use client";

import { useState, useSyncExternalStore } from "react";
import { getImageProps } from "next/image";
import { Dialog } from "@/components/ui/dialog";

import { buttonClassName } from "@/components/ui/button";
import { type CmsPage } from "@/lib/cms/types";

type CinematicHeroMediaProps = {
  page: CmsPage;
};

type HeroStoryLightboxButtonProps = {
  page: CmsPage;
};

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
};

const defaultHeroDesktopImage = "/media/hero/nestfoodsltd-desktop-hero-banner2.png";
const defaultHeroMobileImage = "/media/hero/nestfoodsltd-mobile-hero-image.png";
const defaultHeroPoster = defaultHeroDesktopImage;

function shouldPreferStaticMedia() {
  if (typeof window === "undefined") {
    return true;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const compactViewport = window.matchMedia("(max-width: 767px)").matches;
  const connection = (navigator as NavigatorWithConnection).connection;
  const saveData = Boolean(connection?.saveData);
  const slowConnection =
    connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g";

  return reduceMotion || compactViewport || saveData || slowConnection;
}

function subscribeMediaPreference(callback: () => void) {
  const queries = [
    window.matchMedia("(prefers-reduced-motion: reduce)"),
    window.matchMedia("(max-width: 767px)"),
  ];
  const connection = (navigator as NavigatorWithConnection).connection as EventTarget | undefined;
  queries.forEach((query) => query.addEventListener("change", callback));
  connection?.addEventListener("change", callback);
  return () => {
    queries.forEach((query) => query.removeEventListener("change", callback));
    connection?.removeEventListener("change", callback);
  };
}

const canUseVideo = () => !shouldPreferStaticMedia();
const staticOnServer = () => false;

function normalizeHeroSource(source: string | undefined, fallback: string) {
  const trimmed = source?.trim();
  if (!trimmed || trimmed.includes("/placeholders/")) {
    return fallback;
  }
  return trimmed;
}

function MediaImage({
  desktopSrc,
  mobileSrc,
  alt,
  priority = false,
}: {
  desktopSrc: string;
  mobileSrc?: string;
  alt: string;
  priority?: boolean;
}) {
  const resolvedMobileSrc = mobileSrc?.trim() || desktopSrc;
  const { props: desktopProps } = getImageProps({
    src: desktopSrc,
    alt,
    width: 1536,
    height: 785,
    sizes: "100vw",
    quality: 75,
    unoptimized: !desktopSrc.startsWith("/"),
  });
  const { props: mobileProps } = getImageProps({
    src: resolvedMobileSrc,
    alt,
    width: 1024,
    height: 1536,
    sizes: "100vw",
    quality: 75,
    unoptimized: !resolvedMobileSrc.startsWith("/"),
  });

  return (
    <picture>
      <source
        media="(max-width: 767px)"
        srcSet={mobileProps.srcSet ?? mobileProps.src}
        sizes="100vw"
      />
      {/* Separate mobile art direction uses a native picture element. */}
      <img
        {...desktopProps}
        alt={alt}
        fetchPriority={priority ? "high" : "auto"}
        className="h-full w-full object-cover object-center md:absolute md:left-0 md:top-1/2 md:h-auto md:min-h-full md:w-full md:-translate-y-1/2"
        loading={priority ? "eager" : "lazy"}
      />
    </picture>
  );
}

export function CinematicHeroMedia({ page }: CinematicHeroMediaProps) {
  const wantsVideo =
    (page.heroMediaKind ?? (page.heroVideoUrl ? "video" : "image")) === "video" &&
    Boolean(page.heroVideoUrl);
  const canPlayVideo = useSyncExternalStore(subscribeMediaPreference, canUseVideo, staticOnServer);

  const desktopImage = normalizeHeroSource(page.heroImageUrl, defaultHeroDesktopImage);
  const mobileImage = normalizeHeroSource(page.heroImageMobileUrl, defaultHeroMobileImage);
  const posterImage = normalizeHeroSource(
    page.heroVideoPosterUrl ?? page.heroImageUrl,
    desktopImage,
  );
  const staticImage = wantsVideo ? posterImage : desktopImage;

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {wantsVideo && canPlayVideo && page.heroVideoUrl ? (
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={posterImage}
        >
          <source src={page.heroVideoUrl} />
        </video>
      ) : (
        <MediaImage desktopSrc={staticImage} mobileSrc={mobileImage} alt="" priority />
      )}
    </div>
  );
}

export function HeroStoryLightboxButton({ page }: HeroStoryLightboxButtonProps) {
  const [open, setOpen] = useState(false);
  const videoUrl = page.heroVideoUrl;
  const posterImage = normalizeHeroSource(
    page.heroVideoPosterUrl ?? page.heroImageUrl,
    defaultHeroPoster,
  );

  if (!videoUrl) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={buttonClassName({
          variant: "secondary",
          className: "border-white/18 bg-white/12 text-white hover:bg-white/18 hover:text-white",
        })}
      >
        Watch Our Story
      </button>

      {open ? (
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          label="Watch De-Nest Bread story video"
          className="max-w-5xl bg-black p-0 text-white"
        >
          <div className="w-full max-w-5xl overflow-hidden rounded-[1.5rem] border border-white/14 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                De-Nest Bread Story
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-11 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <video
              controls
              playsInline
              poster={posterImage}
              className="aspect-video w-full bg-black"
            >
              <source src={videoUrl} />
            </video>
          </div>
        </Dialog>
      ) : null}
    </>
  );
}
