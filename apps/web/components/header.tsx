import Link from "next/link";

import { BrandLogo } from "./brand-logo";
import { CartLink } from "./cart/cart-link";
import { GlobalSearch } from "./customer/global-search";
import { LocaleCurrencySwitcher } from "./customer/locale-currency-switcher";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { href: "/shop", label: "Wholesale" },
  { href: "/about", label: "About" },
  { href: "/recipes", label: "Recipes" },
  { href: "/traceability", label: "Traceability" },
  { href: "/b2b", label: "Distributor" },
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
              Wholesale commerce, distributor workflows, traceability, and customer discovery in a
              single surface.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <GlobalSearch />
            <LocaleCurrencySwitcher />
            <MobileNav />
            <CartLink />
            <Link
              href="/account"
              className="hidden rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-2 text-xs font-medium text-neutral-700 transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:text-neutral-200 md:inline-flex"
            >
              Account
            </Link>
            <ThemeToggle />
          </div>
        </div>

        <div className="hidden items-center justify-between gap-4 border-t border-[color:var(--border)] px-5 py-3 md:flex">
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
            href="/shop"
            className="section-kicker rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-2 text-[0.68rem] text-neutral-900 transition hover:-translate-y-0.5 hover:brightness-105 dark:text-neutral-100"
          >
            Open Wholesale Catalog
          </Link>
        </div>
      </div>
    </header>
  );
}
