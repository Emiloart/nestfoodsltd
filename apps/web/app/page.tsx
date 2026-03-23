import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { PersonalizedRail } from "@/components/customer/personalized-rail";
import { FadeIn } from "@/components/motion/fade-in";
import { JsonLd } from "@/components/seo/json-ld";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cmsPageMetadata } from "@/lib/cms/metadata";
import { getCmsBanners, getCmsPage } from "@/lib/cms/service";
import { buildFaqStructuredData } from "@/lib/seo/structured-data";

const quickLinks = [
  {
    href: "/shop",
    title: "Wholesale Catalog",
    description: "Region-aware catalog with bulk order ranges and availability controls.",
  },
  { href: "/recipes", title: "Recipes", description: "Editorial and ingredient-based discovery." },
  {
    href: "/traceability",
    title: "Traceability",
    description: "Batch lookup timeline with source, processing, and certifications.",
  },
  {
    href: "/b2b",
    title: "Distributor Portal",
    description: "Bulk orders, pricing tiers, and quotes.",
  },
];

const homeFaqEntries = [
  {
    question: "Does Nest Foods support distributor and bulk orders?",
    answer:
      "Yes. Approved distributor accounts can request quotes, access tiered pricing, and track B2B order workflows.",
  },
  {
    question: "Can customers verify product traceability?",
    answer:
      "Yes. The traceability portal provides batch-level sourcing, processing milestones, and certification history.",
  },
  {
    question: "How are nutrition and allergen details managed?",
    answer:
      "Each product includes structured nutrition tables, ingredient details, and allergen disclosures managed through the admin system.",
  },
];

const trustHighlights = [
  "Enterprise Security",
  "Batch Traceability",
  "Distributor Ready",
  "NDPR-Aligned Flows",
];

const platformSignals = [
  {
    value: "4",
    label: "Core lanes",
    description: "Commerce, recipes, traceability, and B2B distribution stay connected.",
  },
  {
    value: "24/7",
    label: "Operational clarity",
    description: "The experience is designed to keep product, customer, and admin actions readable.",
  },
  {
    value: "NDPR",
    label: "Privacy posture",
    description: "Consent and data request flows are part of the product surface, not an afterthought.",
  },
];

export default async function HomePage() {
  const [page, banners] = await Promise.all([getCmsPage("home"), getCmsBanners()]);
  const primaryBanner = banners[0];
  const faqStructuredData = buildFaqStructuredData(homeFaqEntries);

  return (
    <div className="grain-background pb-10">
      <JsonLd id="home-faq-ld" data={faqStructuredData} />
      <section className="hero-ripple mx-auto w-full max-w-7xl px-4 pb-10 pt-8 md:px-6 md:pb-14 md:pt-14">
        <FadeIn className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:items-end">
          <div className="max-w-3xl space-y-8">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <p className="section-kicker">Nest Foods Digital Platform</p>
                <Badge>Cleaner browsing for mobile and desktop</Badge>
              </div>
              <BrandLogo href={null} />
              <h1 className="display-heading text-5xl text-neutral-900 dark:text-neutral-50 sm:text-6xl lg:text-7xl">
                {page.headline}
              </h1>
              <p className="pretty-text max-w-2xl text-base leading-8 text-neutral-600 dark:text-neutral-300 md:text-lg">
                {page.description}
              </p>
            </div>

            {primaryBanner ? (
              <div className="section-frame px-5 py-5">
                <p className="section-kicker">{primaryBanner.label}</p>
                <p className="pretty-text mt-3 text-base leading-7 text-neutral-800 dark:text-neutral-200">
                  {primaryBanner.headline}
                </p>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {trustHighlights.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-neutral-700 shadow-[0_12px_28px_rgba(63,43,23,0.05)] dark:text-neutral-200"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={page.ctaPrimaryHref ?? "/shop"}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--brand-1),var(--brand-2))] px-6 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:brightness-105 sm:w-auto"
              >
                {page.ctaPrimaryLabel ?? "Explore Wholesale Catalog"}
              </Link>
              <Link
                href={page.ctaSecondaryHref ?? "/about"}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-6 text-sm font-medium text-neutral-900 transition hover:-translate-y-0.5 hover:brightness-105 dark:text-neutral-100 sm:w-auto"
              >
                {page.ctaSecondaryLabel ?? "Explore Brand Story"}
              </Link>
              {primaryBanner?.ctaLabel && primaryBanner.ctaHref ? (
                <Link
                  href={primaryBanner.ctaHref}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--border)] bg-transparent px-6 text-sm font-medium text-neutral-900 transition hover:-translate-y-0.5 hover:bg-[color:var(--surface-strong)] dark:text-neutral-100 sm:w-auto"
                >
                  {primaryBanner.ctaLabel}
                </Link>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {platformSignals.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-4"
                >
                  <p className="display-heading text-3xl text-neutral-900 dark:text-neutral-100">
                    {item.value}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
                    {item.label}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="section-frame p-4 sm:p-5 lg:p-6">
            <div className="grid gap-4">
              <ImagePlaceholder
                src={
                  primaryBanner?.imageUrl ??
                  page.heroImageUrl ??
                  "/placeholders/hero-image-placeholder.svg"
                }
                alt="Nest Foods hero placeholder"
                label="Platform Hero"
                className="aspect-[6/5] sm:aspect-[5/4] lg:aspect-[4/5]"
                priority
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="card-surface rounded-[1.35rem] p-4">
                  <p className="section-kicker">Content System</p>
                  <p className="pretty-text mt-3 text-sm leading-7 text-neutral-700 dark:text-neutral-200">
                    Banners, page content, and media are structured so the interface can evolve
                    without losing consistency.
                  </p>
                </div>
                <div className="card-surface rounded-[1.35rem] p-4">
                  <p className="section-kicker">Operator View</p>
                  <p className="pretty-text mt-3 text-sm leading-7 text-neutral-700 dark:text-neutral-200">
                    Catalog, customer, and traceability flows sit close enough together to support
                    real-world food operations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-6 md:px-6">
        <div className="section-frame px-5 py-6 sm:px-6 sm:py-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="section-kicker">Platform Modules</p>
              <h2 className="display-heading mt-3 text-3xl text-neutral-900 dark:text-neutral-100 sm:text-4xl">
                Clearer sections, faster scanning, and a calmer visual hierarchy.
              </h2>
            </div>
            <p className="pretty-text max-w-xl text-sm leading-7 text-neutral-600 dark:text-neutral-300">
              Each major lane is now easier to parse on smaller screens and less crowded on larger
              ones, with stronger left alignment and more deliberate spacing.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickLinks.map((item, index) => (
              <FadeIn key={item.href} delay={(index + 1) * 0.06}>
                <Link href={item.href} className="block transition hover:-translate-y-1">
                  <Card className="h-full border-[color:var(--border)] bg-[color:var(--surface-strong)]">
                    <p className="section-kicker">Open section</p>
                    <h3 className="mt-3 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                      {item.description}
                    </p>
                    <p className="mt-6 text-xs font-medium uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
                      Explore now
                    </p>
                  </Card>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-10 md:px-6">
        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="section-frame p-4 sm:p-5">
            <div className="grid gap-4">
              <ImagePlaceholder
                src={page.logoImageUrl ?? "/placeholders/logo-placeholder.svg"}
                alt="Nest Foods logo placeholder"
                label="Brand Mark"
                className="aspect-[16/9] bg-[color:var(--surface-strong)] p-6"
              />
              <ImagePlaceholder
                src={page.seo.ogImageUrl ?? "/placeholders/section-image-placeholder.svg"}
                alt="Open Graph placeholder"
                label="Campaign Asset"
                className="aspect-[16/10]"
              />
            </div>
          </div>

          <div className="section-frame px-5 py-6 sm:px-6 sm:py-7">
            <p className="section-kicker">Trust and Operations</p>
            <h2 className="display-heading mt-3 text-3xl text-neutral-900 dark:text-neutral-100 sm:text-4xl">
              A premium food interface should feel dependable before a user reads the fine print.
            </h2>
            <div className="mt-6 grid gap-3">
              {homeFaqEntries.map((entry) => (
                <div
                  key={entry.question}
                  className="rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-5 py-5"
                >
                  <p className="balance-text text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {entry.question}
                  </p>
                  <p className="pretty-text mt-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                    {entry.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <PersonalizedRail />
    </div>
  );
}

export async function generateMetadata() {
  const page = await getCmsPage("home", { preview: true });
  return cmsPageMetadata(page, { path: "/" });
}
