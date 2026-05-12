"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setCompact(window.scrollY > 28);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <div className="brand-shell w-full border-b border-white/10 transition-all duration-300">
        <div
          className={cn(
            "flex items-center justify-between gap-3 px-4 transition-all duration-300 md:px-6",
            compact ? "min-h-[3.35rem] py-1.5" : "min-h-[4rem] py-2.5",
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <BrandLogo className="min-w-0" tone="inverse" compact={compact} />
          </div>

          <div className="flex items-center gap-2">
            <GlobalSearch />
            <MobileNav compact={compact} />
          </div>
        </div>

        <div
          className={cn(
            "hidden items-center gap-4 overflow-hidden border-t border-white/10 px-6 transition-all duration-300 lg:flex",
            compact ? "max-h-10 py-1" : "max-h-14 py-2",
          )}
        >
          <nav aria-label="Primary navigation" className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full text-white/76 transition hover:bg-white/10 hover:text-[color:var(--brand-3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]",
                  compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
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
