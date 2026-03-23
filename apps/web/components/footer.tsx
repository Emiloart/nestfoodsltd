import Link from "next/link";

const links = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/careers", label: "Careers" },
  { href: "/sustainability", label: "Sustainability" },
];

export function Footer() {
  return (
    <footer className="px-3 pb-4 pt-4 md:px-4 md:pb-6">
      <div className="shell-surface mx-auto w-full max-w-7xl rounded-[1.8rem] border">
        <div className="grid gap-8 px-4 py-8 md:px-6 md:py-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="section-kicker">Nest Foods Digital Platform</p>
            <h2 className="display-heading mt-3 text-3xl text-neutral-900 dark:text-neutral-100 sm:text-4xl">
              Built for trusted food growth across Africa.
            </h2>
            <p className="pretty-text mt-4 max-w-xl text-sm leading-7 text-neutral-600 dark:text-neutral-300">
              Premium food manufacturing, distribution, and digital commerce in one calmer, more
              operationally focused interface.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-200">
                Wholesale Ready
              </span>
              <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-200">
                Batch Traceability
              </span>
              <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-200">
                NDPR Aligned
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:items-end">
            <nav
              aria-label="Footer navigation"
              className="flex flex-wrap items-start gap-x-5 gap-y-2 lg:justify-end"
            >
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md text-xs font-medium uppercase tracking-[0.12em] text-neutral-600 transition hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:text-neutral-300 dark:hover:text-neutral-100"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <p className="text-xs leading-6 text-neutral-500 dark:text-neutral-400 lg:max-w-xs lg:text-right">
              Nest Foods Ltd. Premium nutrition, cleaner discovery, and sharper distributor
              workflows.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
