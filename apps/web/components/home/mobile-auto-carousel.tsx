"use client";

import { useReducedMotion } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";

type MobileAutoCarouselProps = {
  items: ReactNode[];
  ariaLabel: string;
  className?: string;
  slideClassName?: string;
};

// Keep the existing component name for callers; slides now advance only on request.
export function MobileAutoCarousel({
  items,
  ariaLabel,
  className,
  slideClassName,
}: MobileAutoCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  function scrollToSlide(index: number) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const boundedIndex = Math.min(Math.max(index, 0), items.length - 1);
    viewport.scrollTo({
      left: boundedIndex * viewport.clientWidth,
      behavior: reduceMotion ? "instant" : "smooth",
    });
    setActiveIndex(boundedIndex);
  }

  if (items.length === 0) return null;

  return (
    <section
      className={cn("md:hidden", className)}
      aria-label={ariaLabel}
      aria-roledescription="carousel"
    >
      <div
        ref={viewportRef}
        className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        tabIndex={0}
        aria-label={`${ariaLabel} slides`}
        onScroll={() => {
          const viewport = viewportRef.current;
          if (viewport?.clientWidth)
            setActiveIndex(
              Math.min(Math.round(viewport.scrollLeft / viewport.clientWidth), items.length - 1),
            );
        }}
      >
        <div className="flex items-stretch">
          {items.map((item, index) => (
            <div
              key={index}
              className={cn("min-w-full px-0.5", slideClassName)}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${items.length}`}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
      {items.length > 1 ? (
        <div className="mt-3 flex items-center justify-between gap-1">
          <button
            type="button"
            aria-label="Previous slide"
            disabled={activeIndex === 0}
            onClick={() => scrollToSlide(activeIndex - 1)}
            className="min-h-11 min-w-11 rounded-full border border-[color:var(--border)] px-3 text-sm font-semibold disabled:opacity-40"
          >
            ←
          </button>
          <div className="flex flex-wrap justify-center">
            {items.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Show slide ${index + 1}`}
                aria-pressed={index === activeIndex}
                onClick={() => scrollToSlide(index)}
                className="grid h-11 w-11 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-[color:var(--brand-1)]"
              >
                <span
                  className={cn(
                    "h-2 rounded-full",
                    index === activeIndex ? "w-6 bg-[color:var(--brand-1)]" : "w-2 bg-neutral-500",
                  )}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="Next slide"
            disabled={activeIndex === items.length - 1}
            onClick={() => scrollToSlide(activeIndex + 1)}
            className="min-h-11 min-w-11 rounded-full border border-[color:var(--border)] px-3 text-sm font-semibold disabled:opacity-40"
          >
            →
          </button>
        </div>
      ) : null}
    </section>
  );
}
