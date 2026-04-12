import Link from "next/link";

import { buttonClassName } from "./ui/button";

const footerGroups = [
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/vision", label: "Vision" },
      { href: "/careers", label: "Careers" },
    ],
  },
  {
    title: "Products",
    links: [
      { href: "/shop", label: "Bread Range" },
      { href: "/traceability", label: "Quality & Traceability" },
      { href: "/sustainability", label: "Sustainability" },
    ],
  },
  {
    title: "Partners",
    links: [
      { href: "/distributor-enquiry", label: "Distributor Enquiries" },
      { href: "/b2b", label: "Distributor Portal" },
    ],
  },
  {
    title: "Insights",
    links: [
      { href: "/blog", label: "Insights" },
      { href: "/recipes", label: "Bread Ideas" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
  {
    title: "Contact",
    links: [
      { href: "/contact", label: "Contact Page" },
      { href: "/contact", label: "Phone & Email" },
      { href: "/contact", label: "Address & Hours" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="px-3 pb-3 pt-3 md:px-4 md:pb-5 md:pt-4">
      <div className="brand-shell mx-auto w-full max-w-7xl rounded-[1.8rem] border">
        <div className="space-y-5 px-4 py-5 md:hidden">
          <div>
            <p className="section-kicker text-[color:var(--brand-3)]">Nest Foods Ltd</p>
            <h2 className="display-heading mt-3 text-3xl text-white">
              Bread quality and traceability, made clear.
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { href: "/shop", label: "Products" },
              { href: "/traceability", label: "Traceability" },
              { href: "/contact", label: "Enquiry" },
              { href: "/distributor-enquiry", label: "Distributor" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={buttonClassName({
                  variant: item.label === "Enquiry" || item.label === "Distributor" ? "primary" : "secondary",
                  size: "sm",
                  className: "min-h-12 rounded-[1.1rem] text-center",
                })}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="grid gap-2">
            {[
              { href: "/about", label: "About Nest Foods" },
              { href: "/shop", label: "Bread Range" },
              { href: "/blog", label: "Insights" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-[1.15rem] border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/82 transition hover:bg-white/10"
              >
                <span>{item.label}</span>
                <span className="text-xs uppercase tracking-[0.14em] text-white/46">Open</span>
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {["Registered Manufacturer", "Hygienic Production", "Batch Traceability"].map(
              (item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[11px] text-white/84"
                >
                  {item}
                </span>
              ),
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/58">
            <Link
              href="/privacy"
              className="transition hover:text-white"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="transition hover:text-white"
            >
              Terms
            </Link>
            <Link
              href="/sustainability"
              className="transition hover:text-white"
            >
              Sustainability
            </Link>
          </div>
        </div>

        <div className="hidden gap-8 px-5 py-8 md:grid md:px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="section-kicker text-[color:var(--brand-3)]">Nest Foods Ltd</p>
            <h2 className="display-heading mt-3 text-3xl text-white sm:text-4xl">
              Bread quality and traceability you can verify.
            </h2>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs text-white/84">
                Registered Manufacturer
              </span>
              <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs text-white/84">
                Hygienic Production
              </span>
              <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs text-white/84">
                Batch Traceability
              </span>
            </div>
            <div className="mt-5 space-y-1.5 text-sm text-white/68">
              <p>Phone and email placeholders live on the contact page.</p>
              <p>Address and business hours stay available for partner enquiries.</p>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <p className="section-kicker text-[color:var(--brand-3)]">{group.title}</p>
                <nav
                  aria-label={`${group.title} footer links`}
                  className="mt-4 flex flex-col gap-3"
                >
                  {group.links.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-sm text-white/72 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]"
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
