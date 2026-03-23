import Link from "next/link";

const footerGroups = [
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/vision", label: "Vision" },
      { href: "/careers", label: "Careers" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Products",
    links: [
      { href: "/shop", label: "Products" },
      { href: "/traceability", label: "Quality & Traceability" },
      { href: "/recipes", label: "Ingredients & Insights" },
      { href: "/b2b", label: "Distributor Portal" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/sustainability", label: "Sustainability" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="px-3 pb-4 pt-4 md:px-4 md:pb-6">
      <div className="shell-surface mx-auto w-full max-w-7xl rounded-[1.8rem] border">
        <div className="grid gap-10 px-4 py-8 md:px-6 md:py-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="section-kicker">Nest Foods Ltd</p>
            <h2 className="display-heading mt-3 text-3xl text-neutral-900 dark:text-neutral-100 sm:text-4xl">
              Premium bread manufacturing with cleaner public trust signals.
            </h2>
            <p className="pretty-text mt-4 max-w-xl text-sm leading-7 text-neutral-600 dark:text-neutral-300">
              The public experience is designed to foreground product quality, production
              discipline, traceability, and reliable supply for households, retailers, and
              approved distribution partners.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-200">
                Registered Manufacturer
              </span>
              <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-200">
                Hygienic Production
              </span>
              <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-200">
                Batch Traceability
              </span>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <p className="section-kicker">{group.title}</p>
                <nav aria-label={`${group.title} footer links`} className="mt-4 flex flex-col gap-3">
                  {group.links.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-sm text-neutral-600 transition hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:text-neutral-300 dark:hover:text-neutral-100"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
