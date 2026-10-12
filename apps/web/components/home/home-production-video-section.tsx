"use client";

import Image from "next/image";
import { useState } from "react";

export function HomeProductionVideoSection() {
  const [requested, setRequested] = useState(false);

  return (
    <section
      aria-label="De-Nest Bread production video"
      className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="section-kicker">Inside the bakery</p>
          <h2 className="display-heading mt-2 text-2xl sm:text-3xl">
            See how De-Nest Bread is made.
          </h2>
        </div>
        <p className="text-sm text-neutral-700">Play the video when you are ready.</p>
      </div>
      <div className="overflow-hidden rounded-2xl bg-[color:var(--brand-2)]">
        {requested ? (
          <video
            className="block aspect-video w-full"
            controls
            autoPlay
            playsInline
            preload="none"
            aria-label="De-Nest Bread production process"
          >
            <source src="/media/videos/nestfoodsltd-production-video2.webm" type="video/webm" />
            Your browser cannot play this video.
          </video>
        ) : (
          <button
            type="button"
            onClick={() => setRequested(true)}
            aria-label="Play De-Nest Bread production video"
            className="relative block aspect-video w-full focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-yellow-300"
          >
            <Image
              src="/media/hero/nestfoodsltd-desktop-hero-banner.jpg"
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover opacity-60"
            />
            <span className="absolute inset-0 grid place-items-center">
              <span className="rounded-full bg-[color:var(--brand-3)] px-6 py-4 text-base font-bold text-[color:var(--brand-2)]">
                ▶ Watch production video
              </span>
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
