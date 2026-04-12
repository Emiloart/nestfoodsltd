"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { buttonClassName } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Products" },
  { href: "/traceability", label: "Quality & Traceability" },
  { href: "/about", label: "About" },
  { href: "/vision", label: "Vision" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

const quickActions = [
  { href: "/b2b", label: "Distributor Portal", variant: "primary" as const },
  { href: "/contact", label: "Make Enquiry", variant: "secondary" as const },
];

const resourceLinks = [
  { href: "/distributor-enquiry", label: "Distributor Enquiry" },
  { href: "/recipes", label: "Bread Ideas" },
  { href: "/blog", label: "Insights" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = "mobile-navigation-panel";

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 border-white/14 bg-white/8 text-white hover:border-white/22 hover:bg-white/12"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="inline-flex h-4 w-4 items-center justify-center">
          {open ? (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
              <path
                d="M6 6l12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>
      </Button>
      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-[rgba(19,8,32,0.3)] backdrop-blur-[3px]"
              onClick={() => setOpen(false)}
            />

            <motion.div
              id={panelId}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              className="section-frame fixed inset-x-3 top-[5.5rem] z-50 max-h-[calc(100vh-6.5rem)] overflow-auto p-4"
            >
              <p className="section-kicker">Browse Nest Foods</p>
              <div className="mt-4 grid gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between rounded-[1.15rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-neutral-700 transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:text-neutral-200"
                    onClick={() => setOpen(false)}
                  >
                    <span>{item.label}</span>
                    <span className="text-xs uppercase tracking-[0.14em] text-neutral-400">
                      Open
                    </span>
                  </Link>
                ))}
              </div>

              <div className="mt-5">
                <p className="section-kicker">Quick links</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {quickActions.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={buttonClassName({
                        variant: item.variant,
                        size: "sm",
                        className: "min-h-12 rounded-[1.1rem] text-center",
                      })}
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="section-kicker">Resources</p>
                <div className="mt-3 grid gap-2">
                  {resourceLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between rounded-[1.15rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-neutral-700 transition hover:-translate-y-0.5 hover:brightness-105 dark:text-neutral-200"
                      onClick={() => setOpen(false)}
                    >
                      <span>{item.label}</span>
                      <span className="text-xs uppercase tracking-[0.14em] text-neutral-400">
                        Open
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
