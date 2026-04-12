import Link from "next/link";

import { BrandLogo } from "./brand-logo";
import { GlobalSearch } from "./customer/global-search";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";
import { buttonClassName } from "./ui/button";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Products" },
  { href: "/traceability", label: "Quality & Traceability" },
  { href: "/about", label: "About" },
  { href: "/vision", label: "Vision" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 px-3 pt-2.5 md:px-4">
      <div className="brand-shell mx-auto w-full max-w-7xl rounded-[1.8rem] border">
        <div className="flex min-h-[4.25rem] items-center justify-between gap-3 px-4 py-3 md:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <BrandLogo className="min-w-0" tone="inverse" />
          </div>

          <div className="flex items-center gap-2">
            <GlobalSearch />
            <MobileNav />
            <Link
              href="/b2b"
              className={buttonClassName({
                variant: "primary",
                size: "sm",
                className: "hidden md:inline-flex",
              })}
            >
              Distributor Portal
            </Link>
            <ThemeToggle />
          </div>
        </div>

        <div className="hidden items-center justify-between gap-4 border-t border-white/10 px-5 py-2.5 lg:flex">
          <nav aria-label="Primary navigation" className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm text-white/76 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/contact"
            className={buttonClassName({ variant: "secondary", size: "sm" })}
          >
            Make Enquiry
          </Link>
        </div>
      </div>
    </header>
  );
}
