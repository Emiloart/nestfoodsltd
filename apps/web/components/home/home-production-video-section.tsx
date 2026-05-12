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
      className="w-full py-6 md:py-8 lg:py-9"
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
    >
      <video
        ref={videoRef}
        className="block aspect-video w-full bg-[color:var(--brand-2)] object-cover"
        muted
        loop
        playsInline
        preload="none"
        aria-label="Production process video"
      >
        {shouldLoad ? <source src={productionVideoSrc} type="video/webm" /> : null}
      </video>
    </section>
  );
}
