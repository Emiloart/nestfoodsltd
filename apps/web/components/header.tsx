import Link from "next/link";

import { BrandLogo } from "./brand-logo";
import { GlobalSearch } from "./customer/global-search";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Products" },
  { href: "/traceability", label: "Quality & Traceability" },
  { href: "/about", label: "About" },
  { href: "/vision", label: "Vision" },
  { href: "/recipes", label: "Ingredients & Insights" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 px-3 pt-3 md:px-4">
      <div className="shell-surface mx-auto w-full max-w-7xl rounded-[1.8rem] border">
        <div className="flex min-h-[4.5rem] items-center justify-between gap-3 px-4 py-3 md:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <BrandLogo className="min-w-0" />
            <p className="pretty-text hidden max-w-sm text-xs leading-6 text-neutral-600 dark:text-neutral-300 xl:block">
              Premium bread manufacturing, quality traceability, and reliable partner supply in one
              public surface.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <GlobalSearch />
            <MobileNav />
            <Link
              href="/b2b"
              className="hidden rounded-full bg-[linear-gradient(135deg,var(--brand-1),var(--brand-2))] px-4 py-2 text-xs font-medium text-white transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 md:inline-flex"
            >
              Distributor Portal
            </Link>
            <ThemeToggle />
          </div>
        </div>

        <div className="hidden items-center justify-between gap-4 border-t border-[color:var(--border)] px-5 py-3 lg:flex">
          <nav aria-label="Primary navigation" className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm text-neutral-600 transition hover:bg-[color:var(--surface-strong)] hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:text-neutral-300 dark:hover:bg-[color:var(--surface-strong)] dark:hover:text-neutral-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/blog"
            className="section-kicker rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-2 text-[0.68rem] text-neutral-900 transition hover:-translate-y-0.5 hover:brightness-105 dark:text-neutral-100"
          >
            Read Insights
          </Link>
        </div>
      </div>
    </header>
  );
}
