import Link from "next/link";

import { BrandLogo } from "./brand-logo";
import { GlobalSearch } from "./global-search";
import { MobileNav } from "./mobile-nav";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/vision", label: "Vision" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50">
      <div className="brand-shell w-full border-b border-white/10">
        <div className="flex min-h-[4.25rem] items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <BrandLogo className="min-w-0" tone="inverse" />
          </div>

          <div className="flex items-center gap-2">
            <GlobalSearch />
            <MobileNav />
          </div>
        </div>

        <div className="hidden items-center gap-4 border-t border-white/10 px-6 py-2.5 lg:flex">
          <nav aria-label="Primary navigation" className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm text-white/76 transition hover:bg-white/10 hover:text-[color:var(--brand-3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
