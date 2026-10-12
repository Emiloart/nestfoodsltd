"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <div className="lg:hidden">
      <Button
        variant="primary"
        size="icon"
        className="h-11 w-11"
        aria-label="Open navigation"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} label="Mobile navigation">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-lg font-bold">Explore Nest Foods</p>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          >
            ×
          </Button>
        </div>
        <nav aria-label="Mobile navigation links" className="grid gap-2">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex min-h-11 items-center rounded-xl px-4 py-3 text-base font-semibold focus-visible:outline-2 focus-visible:outline-[color:var(--brand-1)]",
                  active
                    ? "bg-[color:var(--brand-1)] text-white"
                    : "bg-[color:var(--surface-strong)] text-neutral-800 hover:bg-[color:var(--surface-accent)]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/products#catalogue-search"
          onClick={() => setOpen(false)}
          className="mt-4 flex min-h-11 items-center rounded-xl border border-[color:var(--border)] px-4 py-3 text-sm font-semibold text-[color:var(--brand-1)]"
        >
          Search the product catalogue →
        </Link>
      </Dialog>
    </div>
  );
}
