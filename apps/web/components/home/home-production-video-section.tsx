"use client";

import { useEffect, useRef } from "react";

export function HomeProductionVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let inView = false;
    const updatePlayback = () => {
      if (inView && !document.hidden) {
        void video.play().catch(() => {
          // Native controls remain available if the browser declines autoplay.
        });
      } else {
        video.pause();
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        inView = entry.isIntersecting && entry.intersectionRatio >= 0.35;
        updatePlayback();
      },
      { threshold: [0, 0.35] },
    );
    observer.observe(video);
    document.addEventListener("visibilitychange", updatePlayback);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updatePlayback);
      video.pause();
    };
  }, []);

  return (
    <section
      aria-label="De-Nest Bread production video"
      className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6"
    >
      <div className="mb-4">
        <p className="section-kicker">Inside the bakery</p>
        <h2 className="display-heading mt-2 text-2xl sm:text-3xl">
          See how De-Nest Bread is made.
        </h2>
      </div>
      <div className="overflow-hidden rounded-2xl bg-[color:var(--brand-2)]">
        <video
          ref={videoRef}
          className="block aspect-video w-full"
          controls
          muted
          playsInline
          preload="none"
          poster="/media/hero/nestfoodsltd-desktop-hero-banner.jpg"
          aria-label="De-Nest Bread production process"
        >
          <source src="/media/videos/nestfoodsltd-production-video2.webm" type="video/webm" />
        </video>
      </div>
    </section>
  );
}
