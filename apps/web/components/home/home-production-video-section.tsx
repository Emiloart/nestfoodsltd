"use client";

import { useEffect, useRef, useState } from "react";

const productionVideoSrc = "/media/videos/nestfoodsltd-production-video2.webm";

export function HomeProductionVideoSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [inViewport, setInViewport] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      setInViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nearViewport = Boolean(entry?.isIntersecting);
        if (nearViewport) {
          setShouldLoad(true);
        }
        setInViewport(nearViewport);
      },
      {
        rootMargin: "420px 0px",
        threshold: 0.18,
      },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) {
      return;
    }

    if (inViewport || hovering) {
      void video.play().catch(() => undefined);
      return;
    }

    video.pause();
  }, [hovering, inViewport, shouldLoad]);

  return (
    <section
      ref={sectionRef}
      aria-label="De-Nest Bread production video"
      className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 lg:py-9"
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
    >
      <div className="relative overflow-hidden rounded-[1.8rem] bg-[color:var(--surface-elevated)] shadow-[0_24px_54px_rgba(46,18,69,0.12)]">
        <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(252,247,240,0.46)_72%,var(--surface-elevated)_100%)]" />
        <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(90deg,var(--surface-elevated)_0%,transparent_12%,transparent_88%,var(--surface-elevated)_100%)]" />
        <video
          ref={videoRef}
          className="aspect-[16/9] max-h-[42rem] w-full bg-[color:var(--brand-2)] object-cover [mask-image:radial-gradient(ellipse_at_center,black_58%,transparent_100%)]"
          muted
          loop
          playsInline
          preload="none"
          aria-label="Production process video"
        >
          {shouldLoad ? <source src={productionVideoSrc} type="video/webm" /> : null}
        </video>
      </div>
    </section>
  );
}
