import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { buttonClassName } from "@/components/ui/button";
import { SOCIAL_CHANNELS, WHATSAPP_LINKS } from "@/lib/company/contact";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/vision", label: "Vision" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="px-3 pb-3 pt-3 md:px-4 md:pb-5 md:pt-4">
      <div className="brand-shell mx-auto w-full max-w-7xl rounded-[1.8rem] border px-4 py-5 sm:px-6 md:py-7">
        <div className="grid gap-7 lg:grid-cols-[1.05fr_0.7fr_0.85fr] lg:items-start">
          <div className="space-y-4">
            <BrandLogo tone="inverse" />
            <h2 className="display-heading max-w-xl text-3xl text-white sm:text-4xl">
              Baking memories, one slice at a time.
            </h2>
            <p className="pretty-text max-w-lg text-sm leading-7 text-white/68">
              Premium bread manufacturing by Nest Foods Limited, the company behind De-Nest Bread.
            </p>
            <div className="flex flex-wrap gap-2">
              {SOCIAL_CHANNELS.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs text-white/84 transition hover:bg-white/12"
                >
                  {social.label}
                </Link>
              ))}
            </div>
          </div>

          <nav aria-label="Footer links" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
            {footerLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white/72 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="space-y-4 rounded-[1.4rem] border border-white/10 bg-white/8 p-4">
            <p className="section-kicker text-[color:var(--brand-4)]">Contact</p>
            <div className="space-y-2 text-sm text-white/76">
              <Link href="tel:+2347066898953" className="block transition hover:text-white">
                07066898953
              </Link>
              <Link
                href="mailto:info@nestfoodsltd.com"
                className="block transition hover:text-white"
              >
                info@nestfoodsltd.com
              </Link>
              <Link
                href={WHATSAPP_LINKS.general}
                target="_blank"
                rel="noreferrer"
                className={buttonClassName({
                  variant: "primary",
                  size: "sm",
                  className: "mt-2",
                })}
              >
                WhatsApp
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3 border-t border-white/10 pt-4 text-xs text-white/58 sm:flex-row sm:items-center sm:justify-between">
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
