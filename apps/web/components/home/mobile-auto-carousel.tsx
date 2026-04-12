"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useEffectEvent, useMemo, useState, type ReactNode } from "react";

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
  const reduceMotion = useReducedMotion();
  const hasLoop = items.length > 1;
  const renderedItems = useMemo(() => {
    if (!hasLoop) {
      return items;
    }
    return [items[items.length - 1], ...items, items[0]];
  }, [hasLoop, items]);
  const [displayIndex, setDisplayIndex] = useState(hasLoop ? 1 : 0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const activeIndex = hasLoop ? (displayIndex - 1 + items.length) % items.length : 0;

  const goToNextSlide = useEffectEvent(() => {
    if (!hasLoop) {
      return;
    }
    setTransitionEnabled(true);
    setDisplayIndex((current) => current + 1);
  });

  useEffect(() => {
    if (transitionEnabled) {
      return;
    }

    const rafId = window.requestAnimationFrame(() => {
      setTransitionEnabled(true);
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [transitionEnabled]);

  useEffect(() => {
    if (!hasLoop || reduceMotion) {
      return;
    }

    const intervalId = window.setInterval(() => {
      goToNextSlide();
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [hasLoop, intervalMs, reduceMotion]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn("md:hidden", className)} aria-label={ariaLabel}>
      <div className="overflow-hidden">
        <div
          className={cn("flex ease-out", transitionEnabled ? "transition-transform" : "transition-none")}
          onTransitionEnd={() => {
            if (!hasLoop) {
              return;
            }
            if (displayIndex === items.length + 1) {
              setTransitionEnabled(false);
              setDisplayIndex(1);
            }
          }}
          style={{
            transform: `translate3d(-${displayIndex * 100}%, 0, 0)`,
            transitionDuration: transitionEnabled ? `${transitionMs}ms` : "0ms",
          }}
        >
          {renderedItems.map((item, index) => (
            <div key={index} className={cn("min-w-full px-0.5", slideClassName)}>
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
                  setTransitionEnabled(true);
                  setDisplayIndex(index + 1);
                }}
                className={cn(
                  "rounded-full transition-all duration-300",
                  active
                    ? "h-1.5 w-7 bg-[color:var(--brand-1)] dark:bg-[color:var(--brand-3)]"
                    : "h-1.5 w-2.5 bg-[color:var(--border-strong)] dark:bg-white/18",
                )}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
