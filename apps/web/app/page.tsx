import Link from "next/link";

import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCmsPage } from "@/lib/cms/service";

const quickLinks = [
  { href: "/shop", title: "Shop", description: "Premium catalog, filters, and subscriptions." },
  { href: "/recipes", title: "Recipes", description: "Editorial and ingredient-based discovery." },
  { href: "/b2b", title: "Distributor Portal", description: "Bulk orders, pricing tiers, and quotes." },
  { href: "/admin", title: "Admin", description: "Dynamic control over all business content." },
];

export default async function HomePage() {
  const page = await getCmsPage("home");

  return (
    <div className="grain-background">
      <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-20 md:px-6 md:pt-28">
        <FadeIn>
          <div className="max-w-3xl space-y-6">
            <Badge>Enterprise Platform Scaffold</Badge>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-neutral-900 dark:text-neutral-50 md:text-6xl">
              {page.headline}
            </h1>
            <p className="text-base text-neutral-600 dark:text-neutral-300 md:text-lg">
              {page.description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={page.ctaPrimaryHref ?? "/shop"}
                className="inline-flex h-10 items-center rounded-full bg-neutral-900 px-5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-black dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                {page.ctaPrimaryLabel ?? "Browse Products"}
              </Link>
              <Link
                href={page.ctaSecondaryHref ?? "/admin"}
                className="inline-flex h-10 items-center rounded-full border border-neutral-300 px-5 text-sm font-medium text-neutral-900 transition hover:-translate-y-0.5 hover:bg-white dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-900"
              >
                {page.ctaSecondaryLabel ?? "Open Admin"}
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>
      <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 pb-20 md:grid-cols-2 md:px-6">
        {quickLinks.map((item, index) => (
          <FadeIn key={item.href} delay={(index + 1) * 0.06}>
            <Link href={item.href} className="block transition hover:-translate-y-1">
              <Card className="h-full border-neutral-200/80 bg-white/70 backdrop-blur dark:bg-neutral-900/80">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{item.title}</h2>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{item.description}</p>
              </Card>
            </Link>
          </FadeIn>
        ))}
      </section>
    </div>
  );
}
