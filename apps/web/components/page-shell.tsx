import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";

type PageShellProps = {
  title: string;
  headline?: string;
  description: string;
  nextStep?: string;
};

export function PageShell({ title, headline, description, nextStep }: PageShellProps) {
  return (
    <section className="hero-ripple mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
        <div className="section-frame px-5 py-7 sm:px-6 sm:py-8">
          <p className="section-kicker">{title}</p>
          <h1 className="display-heading mt-4 text-4xl text-neutral-900 dark:text-neutral-100 sm:text-5xl">
            {headline ?? title}
          </h1>
          <p className="pretty-text mt-4 max-w-2xl text-[0.98rem] leading-7 text-neutral-600 dark:text-neutral-300">
            {description}
          </p>
          <div className="mt-5 rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-4 lg:hidden">
            <p className="text-xs uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
              Next step
            </p>
            <p className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">/shop</p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className={buttonClassName({ variant: "secondary" })}
            >
              View Product Range
            </Link>
            <Link
              href="/contact"
              className={buttonClassName({ variant: "primary" })}
            >
              Contact Team
            </Link>
          </div>
        </div>

        <div className="section-frame hidden px-5 py-6 lg:block">
          <p className="section-kicker">Next Step</p>
          <p className="pretty-text mt-4 text-sm leading-7 text-neutral-700 dark:text-neutral-200">
            {nextStep ?? "Continue to the product catalog or contact Nest Foods."}
          </p>
          <div className="mt-5 rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
              Route
            </p>
            <p className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">/shop</p>
          </div>
        </div>
      </div>
    </section>
  );
}
