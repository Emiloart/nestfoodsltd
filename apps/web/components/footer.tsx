import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { FacebookIcon } from "@/components/social-icons";
import { SOCIAL_CHANNELS } from "@/lib/company/contact";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer>
      <div className="brand-shell w-full border-t border-white/10 px-4 py-4 sm:px-6 md:px-8 md:py-5">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-3">
            <BrandLogo tone="inverse" compact />
            <h2 className="display-heading max-w-xl text-2xl text-white sm:text-3xl">
              Baking memories, one slice at a time.
            </h2>
            <p className="pretty-text max-w-lg text-sm leading-6 text-white/68">
              Premium bread manufacturing by Nest Foods Limited, the company behind De-Nest Bread.
            </p>
            <div className="flex flex-wrap gap-2">
              {SOCIAL_CHANNELS.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs text-white/84 transition hover:bg-white/12"
                >
                  <FacebookIcon className="h-3.5 w-3.5" />
                  {social.label}
                </Link>
              ))}
            </div>
          </div>

          <nav aria-label="Footer links" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {footerLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-center text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-white/72 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-3 text-xs text-white/58 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Nest Foods Limited. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="transition hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-white">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
