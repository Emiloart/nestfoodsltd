import Link from "next/link";

import { type CmsPage } from "@/lib/cms/types";

type HomeCareersSectionProps = {
  careersPage: CmsPage;
};

export function HomeCareersSection({ careersPage }: HomeCareersSectionProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <div className="section-frame px-5 py-6 sm:px-6 sm:py-7">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-3xl">
            <p className="section-kicker">Careers</p>
            <h2 className="display-heading mt-3 text-3xl text-neutral-900 dark:text-neutral-100 sm:text-4xl">
              {careersPage.headline}
            </h2>
            <p className="pretty-text mt-4 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
              {careersPage.description}
            </p>
          </div>

          <Link
            href="/careers"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-6 text-sm font-medium text-neutral-900 transition hover:-translate-y-0.5 hover:brightness-105 dark:text-neutral-100"
          >
            View Open Roles
          </Link>
        </div>
      </div>
    </section>
  );
}
