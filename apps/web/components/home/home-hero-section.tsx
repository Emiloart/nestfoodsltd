import Link from "next/link";
import { Montserrat, Playfair_Display } from "next/font/google";

import { CinematicHeroMedia } from "@/components/media/cinematic-hero-media";
import { FadeIn } from "@/components/motion/fade-in";
import { buttonClassName } from "@/components/ui/button";
import { type CmsPage } from "@/lib/cms/types";

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

type HomeHeroSectionProps = {
  page: CmsPage;
};

export function HomeHeroSection({ page }: HomeHeroSectionProps) {
  return (
    <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden bg-[color:var(--brand-2)]">
      <CinematicHeroMedia page={page} />
      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-7xl items-start px-4 pt-9 md:px-6 md:pt-10 lg:px-4 lg:pt-12">
        <FadeIn className="w-full">
          <div className="mx-auto max-w-3xl space-y-5 text-left text-white md:mx-0 lg:-ml-8 xl:-ml-12">
            <div className="space-y-1.5">
              <p
                className={`${playfairDisplay.className} text-balance break-words text-[clamp(2rem,4.6vw,3.35rem)] font-bold leading-[0.98] tracking-[0.07em] text-white`}
              >
                DE NEST BREAD
              </p>
              <p
                className={`${montserrat.className} text-balance break-words text-[clamp(1rem,2.2vw,1.55rem)] font-semibold uppercase leading-[1.12] tracking-[0.08em] text-white [text-shadow:-1px_-1px_0_#d71f1f,1px_-1px_0_#d71f1f,-1px_1px_0_#d71f1f,1px_1px_0_#d71f1f]`}
              >
                Nest Foods Limited
              </p>
            </div>

            <div className="space-y-2.5">
              <h1
                className={`${playfairDisplay.className} hero-slogan max-w-3xl text-balance break-words text-[clamp(1.45rem,3.25vw,2.35rem)] font-bold leading-[1.08] text-white`}
              >
                Every loaf is a testament to our commitment to quality
              </h1>
              <p className="max-w-2xl text-balance break-words text-[clamp(0.97rem,1.6vw,1.18rem)] leading-7 text-white">
                Fresh. Healthy. For every family.
                <span className="block">. 100% bromate and saccharine free.</span>
              </p>
            </div>

            <div className="pt-1">
              <Link href={page.ctaPrimaryHref ?? "/products"} className={buttonClassName({ variant: "primary" })}>
                Explore Products
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
