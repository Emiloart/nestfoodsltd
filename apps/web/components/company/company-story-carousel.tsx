"use client";

import { Montserrat, Playfair_Display } from "next/font/google";
import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, useState } from "react";

import {
  COMPANY_MISSION,
  COMPANY_STORY,
  COMPANY_VISION,
  CORE_VALUES,
  FOUNDER_STORY,
} from "@/lib/company/about";
import { cn } from "@/lib/cn";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

type StorySlide = {
  id: string;
  eyebrow: string;
  title: string;
  render: () => ReactNode;
};

const slides: StorySlide[] = [
  {
    id: "about",
    eyebrow: "About Nest Foods Limited",
    title: "A Nigerian bakery built on quality.",
    render: () => (
      <div className="space-y-4">
        {COMPANY_STORY.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-7 text-white/76">
            {paragraph}
          </p>
        ))}
      </div>
    ),
  },
  {
    id: "vision-mission",
    eyebrow: "Vision & Mission",
    title: "Where the company is going.",
    render: () => (
      <div className="space-y-5">
        <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.055] p-4">
          <p className="text-[0.66rem] font-black uppercase tracking-[0.18em] text-[color:var(--brand-3)]">
            Vision
          </p>
          <p className="mt-2 text-sm leading-7 text-white/78">{COMPANY_VISION}</p>
        </div>
        <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.035] p-4">
          <p className="text-[0.66rem] font-black uppercase tracking-[0.18em] text-[color:var(--brand-3)]">
            Mission
          </p>
          <p className="mt-2 text-sm leading-7 text-white/78">{COMPANY_MISSION}</p>
        </div>
      </div>
    ),
  },
  {
    id: "founder",
    eyebrow: "Founder Story",
    title: "Mr. Obinna Paulinus Nwosu",
    render: () => (
      <div className="space-y-4">
        {FOUNDER_STORY.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-7 text-white/76">
            {paragraph}
          </p>
        ))}
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/48">
          RC: 2001646
        </p>
      </div>
    ),
  },
  {
    id: "values",
    eyebrow: "Core Values",
    title: "Principles behind De-Nest Bread.",
    render: () => (
      <div className="grid gap-3 sm:grid-cols-2">
        {CORE_VALUES.map((value) => (
          <div key={value.title} className="rounded-[1rem] border border-white/10 bg-white/[0.05] p-3">
            <h3 className="text-sm font-bold text-white">{value.title}</h3>
            <p className="mt-2 text-xs leading-6 text-white/70">{value.body}</p>
          </div>
        ))}
      </div>
    ),
  },
];

export function CompanyStoryCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex] ?? slides[0]!;
  const previousSlide = () => {
    setActiveIndex((current) => (current === 0 ? slides.length - 1 : current - 1));
  };
  const nextSlide = () => {
    setActiveIndex((current) => (current === slides.length - 1 ? 0 : current + 1));
  };

  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[color:var(--brand-2)] text-white shadow-[0_22px_44px_rgba(46,18,69,0.22)]">
      <div className="grid gap-0 lg:grid-cols-[0.38fr_0.62fr]">
        <div className="border-b border-white/10 bg-white/[0.045] p-4 sm:p-5 lg:border-b-0 lg:border-r">
          <p
            className={`${montserrat.className} text-xs font-semibold uppercase tracking-[0.18em] text-white/54`}
          >
            Nest Foods Limited
          </p>
          <h2
            className={`${playfairDisplay.className} mt-3 max-w-sm text-[clamp(2rem,4vw,3rem)] font-bold leading-[0.98] text-white`}
          >
            About De-Nest Bread
          </h2>
          <div className="mt-5 grid gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "rounded-full border px-4 py-2 text-left text-xs font-black uppercase tracking-[0.14em] transition",
                  activeIndex === index
                    ? "border-[color:var(--brand-3)] bg-[color:var(--brand-3)] text-[color:var(--brand-2)]"
                    : "border-white/12 bg-white/[0.045] text-white/72 hover:bg-white/[0.09] hover:text-white",
                )}
              >
                {slide.eyebrow}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={previousSlide}
              className="rounded-full border border-white/14 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white/76 transition hover:border-white/30 hover:text-white"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[color:var(--brand-2)] transition hover:bg-[color:var(--brand-3)]"
            >
              Next
            </button>
          </div>
        </div>

        <article className="relative min-h-[28rem] p-4 sm:p-6 lg:min-h-[32rem]" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <p
                className={`${montserrat.className} text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-3)]`}
              >
                {activeSlide.eyebrow}
              </p>
              <h3
                className={`${playfairDisplay.className} mt-3 text-balance text-[clamp(1.75rem,3.2vw,2.8rem)] font-bold leading-[1.02] text-white`}
              >
                {activeSlide.title}
              </h3>
              <div className="relative mt-5">
                <div className="max-h-[18.5rem] overflow-y-auto pr-3 sm:max-h-[20rem] lg:max-h-[21.5rem]">
                  {activeSlide.render()}
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[color:var(--brand-2)] to-transparent" />
              </div>
            </motion.div>
          </AnimatePresence>
        </article>
      </div>
    </div>
  );
}
