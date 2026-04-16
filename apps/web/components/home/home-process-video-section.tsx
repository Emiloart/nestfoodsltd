"use client";

import { useState } from "react";

import { ImagePlaceholder } from "@/components/image-placeholder";
import { FadeIn } from "@/components/motion/fade-in";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type HomeProcessVideoSectionProps = {
  youtubeId?: string;
};

const processHighlights = [
  "Production environment overview",
  "Quality-led handling routines",
  "Packaging and dispatch discipline",
];

function buildEmbedUrl(youtubeId: string) {
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
  });

  return `https://www.youtube.com/embed/${youtubeId}?${params.toString()}`;
}

export function HomeProcessVideoSection({ youtubeId }: HomeProcessVideoSectionProps) {
  const resolvedYoutubeId = youtubeId ?? process.env.NEXT_PUBLIC_HOME_PROCESS_VIDEO_ID;
  const [showVideo, setShowVideo] = useState(false);
  const canEmbedVideo = Boolean(resolvedYoutubeId);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <FadeIn className="grid gap-5 lg:grid-cols-[minmax(0,0.96fr)_minmax(340px,1.04fr)] lg:items-center">
        <div className="space-y-4">
          <p className="section-kicker">Watch Our Process</p>
          <h2 className="display-heading text-3xl text-neutral-900 sm:text-4xl">
            A lower-page video section for brand and production storytelling.
          </h2>
          <p className="pretty-text max-w-2xl text-[0.98rem] leading-7 text-neutral-600">
            The first screen stays restrained. This section is where Nest Foods can introduce a
            future process or brand film without turning the homepage into a portal or media-heavy
            experience.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {processHighlights.map((highlight) => (
              <Card key={highlight} className="space-y-2 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Process
                </p>
                <p className="text-sm text-neutral-700">{highlight}</p>
              </Card>
            ))}
          </div>
        </div>

        <div className="section-frame p-4 sm:p-5">
          {showVideo && canEmbedVideo ? (
            <div className="overflow-hidden rounded-[1.6rem] border border-[color:var(--border)] bg-[color:var(--surface-overlay)]">
              <iframe
                className="aspect-video w-full"
                src={buildEmbedUrl(resolvedYoutubeId!)}
                title="Nest Foods process video"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="relative">
              <ImagePlaceholder
                src="/placeholders/sections/process-placeholder.svg"
                alt="Nest Foods process video placeholder"
                label="Process Video"
                className="aspect-video"
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(47,36,29,0.04),rgba(47,36,29,0.28))]" />
              <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-3 p-5">
                {canEmbedVideo ? (
                  <button
                    type="button"
                    className={buttonClassName({ variant: "primary", size: "sm" })}
                    onClick={() => setShowVideo(true)}
                  >
                    Play Process Video
                  </button>
                ) : (
                  <span className={buttonClassName({ variant: "secondary", size: "sm" })}>
                    Video Placeholder
                  </span>
                )}
                <p className="max-w-md text-xs uppercase tracking-[0.14em] text-[color:var(--brand-2)]">
                  YouTube stays lower on the page and loads only on demand.
                </p>
              </div>
            </div>
          )}
        </div>
      </FadeIn>
    </section>
  );
}
