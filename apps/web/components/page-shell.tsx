import Link from "next/link";

type PageShellProps = {
  title: string;
  headline?: string;
  description: string;
  nextStep?: string;
};

export function PageShell({ title, headline, description, nextStep }: PageShellProps) {
  return (
    <section className="hero-ripple mx-auto w-full max-w-7xl px-4 py-12 md:px-6 md:py-16">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
        <div className="section-frame px-6 py-8 sm:px-8 sm:py-10">
          <p className="section-kicker">{title}</p>
          <h1 className="display-heading mt-4 text-4xl text-neutral-900 dark:text-neutral-100 sm:text-5xl">
            {headline ?? title}
          </h1>
          <p className="pretty-text mt-5 max-w-2xl text-base leading-8 text-neutral-600 dark:text-neutral-300">
            {description}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-5 py-3 text-center text-xs font-medium uppercase tracking-[0.15em] text-neutral-800 transition hover:-translate-y-0.5 hover:brightness-105 dark:text-neutral-100"
            >
              Back Home
            </Link>
            <Link
              href="/contact"
              className="rounded-full bg-[linear-gradient(135deg,var(--brand-1),var(--brand-2))] px-5 py-3 text-center text-xs font-medium uppercase tracking-[0.15em] text-white transition hover:-translate-y-0.5 hover:brightness-105"
            >
              Contact Team
            </Link>
          </div>
        </div>

        <div className="section-frame px-6 py-7">
          <p className="section-kicker">Next Step</p>
          <p className="pretty-text mt-4 text-sm leading-7 text-neutral-700 dark:text-neutral-200">
            {nextStep ?? "Reach the Nest Foods team to move from browsing to implementation."}
          </p>
          <div className="mt-5 rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
              Primary route
            </p>
            <p className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
              /contact
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
