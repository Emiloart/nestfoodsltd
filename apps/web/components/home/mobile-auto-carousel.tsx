"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";

type MobileAutoCarouselProps = {
  items: ReactNode[];
  ariaLabel: string;
  className?: string;
  slideClassName?: string;
  transitionMs?: number;
  intervalMs?: number;
};

export function MobileAutoCarousel({
  items,
  ariaLabel,
  className,
  slideClassName,
  transitionMs = 550,
  intervalMs = 2000,
}: MobileAutoCarouselProps) {
  return (
    <MobileAutoCarouselInner
      key={`${items.length}-${transitionMs}-${intervalMs}`}
      items={items}
      ariaLabel={ariaLabel}
      className={className}
      slideClassName={slideClassName}
      transitionMs={transitionMs}
      intervalMs={intervalMs}
    />
  );
}

function MobileAutoCarouselInner({
  items,
  ariaLabel,
  className,
  slideClassName,
  transitionMs = 550,
  intervalMs = 2000,
}: MobileAutoCarouselProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const resumeTimeoutRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  const hasLoop = items.length > 1;
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const clearResumeTimeout = useEffectEvent(() => {
    if (resumeTimeoutRef.current) {
      window.clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  });

  const pauseCarousel = useEffectEvent(() => {
    clearResumeTimeout();
    setPaused(true);
  });

  const resumeCarouselSoon = useEffectEvent(() => {
    clearResumeTimeout();
    resumeTimeoutRef.current = window.setTimeout(() => {
      setPaused(false);
      resumeTimeoutRef.current = null;
    }, 1800);
  });

  const scrollToSlide = useEffectEvent((index: number) => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    viewport.scrollTo({
      left: index * viewport.clientWidth,
      behavior: reduceMotion ? "auto" : "smooth",
    });
    setActiveIndex(index);
  });

  const goToNextSlide = useEffectEvent(() => {
    if (!hasLoop || paused) {
      return;
    }
    scrollToSlide((activeIndex + 1) % items.length);
  });

  const handleScroll = useEffectEvent(() => {
    const viewport = viewportRef.current;
    if (!viewport || viewport.clientWidth === 0) {
      return;
    }

    const nextIndex = Math.round(viewport.scrollLeft / viewport.clientWidth);
    setActiveIndex(Math.min(Math.max(nextIndex, 0), items.length - 1));
  });

  useEffect(() => {
    if (!hasLoop || reduceMotion || paused) {
      return;
    }

    const intervalId = window.setInterval(() => {
      goToNextSlide();
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [hasLoop, intervalMs, paused, reduceMotion]);

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) {
        window.clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className={cn("md:hidden", className)}
      aria-label={ariaLabel}
      onPointerEnter={() => pauseCarousel()}
      onPointerLeave={() => resumeCarouselSoon()}
      onPointerDown={() => pauseCarousel()}
      onPointerUp={() => resumeCarouselSoon()}
      onPointerCancel={() => resumeCarouselSoon()}
      onTouchStart={() => pauseCarousel()}
      onTouchEnd={() => resumeCarouselSoon()}
      onFocus={() => pauseCarousel()}
      onBlur={() => resumeCarouselSoon()}
    >
      <div
        ref={viewportRef}
        onScroll={() => handleScroll()}
        className="overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div
          className={cn("flex snap-x snap-mandatory items-stretch", reduceMotion && "scroll-auto")}
          style={{ transitionDuration: `${transitionMs}ms` }}
        >
          {items.map((item, index) => (
            <div key={index} className={cn("min-w-full snap-start px-0.5", slideClassName)}>
              {item}
            </div>
          ))}
        </div>
      </div>

      {hasLoop ? (
        <div className="mt-3 flex items-center justify-center gap-2">
          {items.map((_, index) => {
            const active = index === activeIndex;
            return (
              <button
                key={index}
                type="button"
                aria-label={`Show slide ${index + 1}`}
                aria-pressed={active}
                onClick={() => {
                  pauseCarousel();
                  scrollToSlide(index);
                  resumeCarouselSoon();
                }}
                className={cn(
                  "rounded-full transition-all duration-300",
                  active
                    ? "h-1.5 w-7 bg-[color:var(--brand-1)]"
                    : "h-1.5 w-2.5 bg-[color:var(--border-strong)]",
                )}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
