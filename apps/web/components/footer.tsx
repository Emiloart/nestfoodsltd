import Link from "next/link";

const footerGroups = [
  {
    title: "Company",
    links: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/vision", label: "Vision" },
      { href: "/careers", label: "Careers" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Explore",
    links: [
      { href: "/shop", label: "Products" },
      { href: "/traceability", label: "Quality & Traceability" },
      { href: "/b2b", label: "Distributor Portal" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/recipes", label: "Ingredients" },
      { href: "/blog", label: "Insights" },
      { href: "/contact", label: "Make Enquiry" },
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
    <footer className="px-3 pb-3 pt-3 md:px-4 md:pb-5 md:pt-4">
      <div className="shell-surface mx-auto w-full max-w-7xl rounded-[1.8rem] border">
        <div className="space-y-5 px-4 py-5 md:hidden">
          <div>
            <p className="section-kicker">Nest Foods Ltd</p>
            <h2 className="display-heading mt-3 text-3xl text-neutral-900 dark:text-neutral-100">
              Bread quality, made clear.
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { href: "/shop", label: "Products" },
              { href: "/traceability", label: "Traceability" },
              { href: "/contact", label: "Enquiry" },
              { href: "/b2b", label: "Distributor" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[1.1rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:brightness-105 dark:text-neutral-100"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="grid gap-2">
            {[
              { href: "/about", label: "About Nest Foods" },
              { href: "/recipes", label: "Ingredients" },
              { href: "/blog", label: "Insights" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-[1.15rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-neutral-700 transition hover:brightness-105 dark:text-neutral-200"
              >
                <span>{item.label}</span>
                <span className="text-xs uppercase tracking-[0.14em] text-neutral-400">Open</span>
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {["Registered Manufacturer", "Hygienic Production", "Batch Traceability"].map(
              (item) => (
                <span
                  key={item}
                  className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-[11px] text-neutral-700 dark:text-neutral-200"
                >
                  {item}
                </span>
              ),
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400">
            <Link
              href="/privacy"
              className="transition hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="transition hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Terms
            </Link>
            <Link
              href="/sustainability"
              className="transition hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Sustainability
            </Link>
          </div>
        </div>

        <div className="hidden gap-8 px-5 py-8 md:grid md:px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="section-kicker">Nest Foods Ltd</p>
            <h2 className="display-heading mt-3 text-3xl text-neutral-900 dark:text-neutral-100 sm:text-4xl">
              Bread quality, traceability, and supply you can verify.
            </h2>
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

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <p className="section-kicker">{group.title}</p>
                <nav
                  aria-label={`${group.title} footer links`}
                  className="mt-4 flex flex-col gap-3"
                >
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
