"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

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

const defaultHeroImage = "/placeholders/hero/hero-image-placeholder.svg";
const defaultHeroPoster = "/placeholders/hero/hero-video-poster-placeholder.svg";

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

function isLocalSource(source: string) {
  return source.startsWith("/");
}

function MediaImage({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  if (isLocalSource(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover"
        unoptimized={src.toLowerCase().includes(".svg")}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="h-full w-full object-cover" loading={priority ? "eager" : "lazy"} />
  );
}

export function CinematicHeroMedia({ page }: CinematicHeroMediaProps) {
  const wantsVideo =
    (page.heroMediaKind ?? (page.heroVideoUrl ? "video" : "image")) === "video" &&
    Boolean(page.heroVideoUrl);
  const [canPlayVideo, setCanPlayVideo] = useState(false);

  useEffect(() => {
    if (!wantsVideo) {
      setCanPlayVideo(false);
      return;
    }

    setCanPlayVideo(!shouldPreferStaticMedia());
  }, [wantsVideo]);

  const fallbackImage = page.heroImageUrl ?? defaultHeroImage;
  const posterImage = page.heroVideoPosterUrl ?? page.heroImageUrl ?? defaultHeroPoster;

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
        <MediaImage
          src={wantsVideo ? posterImage : fallbackImage}
          alt=""
          priority
        />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(46,18,69,0.88),rgba(46,18,69,0.62)_45%,rgba(90,36,122,0.34))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(244,228,9,0.22),transparent_28%),radial-gradient(circle_at_82%_10%,rgba(255,255,255,0.12),transparent_30%)]" />
      <div className="hero-grain absolute inset-0 opacity-35" />
    </div>
  );
}

export function HeroStoryLightboxButton({ page }: HeroStoryLightboxButtonProps) {
  const [open, setOpen] = useState(false);
  const videoUrl = page.heroVideoUrl;
  const posterImage = page.heroVideoPosterUrl ?? page.heroImageUrl ?? defaultHeroPoster;

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
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Watch De-Nest Bread story video"
          className="fixed inset-0 z-[90] grid place-items-center bg-black/78 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-5xl overflow-hidden rounded-[1.5rem] border border-white/14 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                De-Nest Bread Story
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/16 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/82 transition hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <video controls playsInline poster={posterImage} className="aspect-video w-full bg-black">
              <source src={videoUrl} />
            </video>
          </div>
        </div>
      ) : null}
    </>
  );
}
