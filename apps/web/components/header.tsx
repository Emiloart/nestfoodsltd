import Link from "next/link";

import { BrandLogo } from "./brand-logo";
import { CartLink } from "./cart/cart-link";
import { GlobalSearch } from "./customer/global-search";
import { LocaleCurrencySwitcher } from "./customer/locale-currency-switcher";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/account", label: "Account" },
  { href: "/about", label: "About" },
  { href: "/recipes", label: "Recipes" },
  { href: "/traceability", label: "Traceability" },
  { href: "/contact", label: "Contact" },
  { href: "/b2b", label: "B2B" },
  { href: "/design-system", label: "System" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/70 bg-white/80 backdrop-blur dark:border-neutral-800/70 dark:bg-neutral-950/80">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
        <BrandLogo />
        <nav aria-label="Primary navigation" className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md text-sm text-neutral-600 transition hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:text-neutral-300 dark:hover:text-neutral-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <GlobalSearch />
          <LocaleCurrencySwitcher />
          <MobileNav />
          <CartLink />
          <Link
            href="/admin"
            className="hidden rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:-translate-y-0.5 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-900 md:inline-flex"
          >
            Admin
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
