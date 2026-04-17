"use client";

import { useEffect, useState } from "react";

import { ImagePlaceholder } from "@/components/image-placeholder";
import { type CmsPage } from "@/lib/cms/types";

type HeroMediaProps = {
  page: CmsPage;
};

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
};

const heroMediaClassName = "aspect-[6/5] sm:aspect-[5/4] lg:aspect-[4/5]";
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

export function HeroMedia({ page }: HeroMediaProps) {
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

  if (!wantsVideo || !canPlayVideo || !page.heroVideoUrl) {
    return (
      <ImagePlaceholder
        src={wantsVideo ? posterImage : fallbackImage}
        alt="Nest Foods production visual"
        label={wantsVideo ? "Production Video" : "Production Visual"}
        className={heroMediaClassName}
        priority
      />
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[1.6rem] border border-[color:var(--border-strong)] bg-[color:var(--surface-overlay)]">
      <video
        className={heroMediaClassName + " w-full object-cover"}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={posterImage}
      >
        <source src={page.heroVideoUrl} />
      </video>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[color:color-mix(in_srgb,var(--brand-2)_24%,transparent)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-20 bg-[color:color-mix(in_srgb,var(--brand-2)_38%,transparent)]"
      />
      <div className="absolute left-4 top-4 rounded-full border border-white/16 bg-[color:color-mix(in_srgb,var(--brand-2)_84%,transparent)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-4)]">
        Production Video
      </div>
    </div>
  );
}
