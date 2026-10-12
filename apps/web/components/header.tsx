"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "./brand-logo";
import { GlobalSearch } from "./global-search";
import { MobileNav } from "./mobile-nav";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50">
      <div className="brand-shell w-full border-b border-white/10 transition-all duration-300">
        <div
          className={cn(
            "flex items-center justify-between gap-3 px-4 transition-all duration-300 md:px-6",
            "min-h-20 py-2",
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <BrandLogo className="min-w-0" tone="inverse" />
          </div>

          <div className="flex items-center gap-2">
            <GlobalSearch />
            <MobileNav />
          </div>
        </div>

        <div className="hidden items-center gap-4 border-t border-white/10 px-6 py-2 lg:flex">
          <nav aria-label="Primary navigation" className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href))
                    ? "page"
                    : undefined
                }
                className={cn(
                  "rounded-full text-white/76 transition hover:bg-white/10 hover:text-[color:var(--brand-3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]",
                  "inline-flex min-h-11 items-center px-4 py-2 text-sm font-semibold",
                  (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)) &&
                    "bg-white/10 text-[color:var(--brand-3)]",
                )}
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
