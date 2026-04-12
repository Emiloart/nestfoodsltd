import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";
import { type CmsPage } from "@/lib/cms/types";

type HomeCareersSectionProps = {
  careersPage: CmsPage;
};

export function HomeCareersSection({ careersPage }: HomeCareersSectionProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 lg:py-9">
      <div className="section-frame px-5 py-5 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-3xl">
            <p className="section-kicker">Careers</p>
            <h2 className="display-heading mt-3 text-3xl text-neutral-900 dark:text-neutral-100 sm:text-4xl">
              {careersPage.headline}
            </h2>
            <p className="pretty-text mt-4 hidden text-sm leading-7 text-neutral-600 dark:text-neutral-300 md:block">
              {careersPage.description}
            </p>
          </div>

          <Link
            href="/careers"
            className={buttonClassName({ variant: "secondary" })}
          >
            View Open Roles
          </Link>
        </div>
      </div>
    </section>
  );
}
