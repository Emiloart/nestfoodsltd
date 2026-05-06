import Link from "next/link";

import { LocationFinder } from "@/components/locations/location-finder";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BRANCH_LOCATIONS,
  CONTACT_CHANNELS,
  HEAD_OFFICE_MAP_URL,
  PENDING_SOCIAL_CHANNELS,
  SAFE_FAQS,
  SOCIAL_CHANNELS,
  WHATSAPP_LINKS,
} from "@/lib/company/contact";
import { cmsPageMetadata } from "@/lib/cms/metadata";
import { getCmsPage } from "@/lib/cms/service";
import { buildFaqStructuredData } from "@/lib/seo/structured-data";

export default async function ContactPage() {
  const page = await getCmsPage("contact");

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 md:px-6">
      <JsonLd id="contact-faq-ld" data={buildFaqStructuredData([...SAFE_FAQS])} />
      <div className="section-frame px-5 py-7 sm:px-6 sm:py-8">
        <Badge>Contact</Badge>
        <h1 className="display-heading mt-4 text-4xl text-neutral-900 sm:text-5xl">
          {page.headline}
        </h1>
        <p className="pretty-text mt-4 max-w-3xl text-[0.98rem] leading-7 text-neutral-600">
          Contact Nest Foods Limited for De-Nest Bread product information, company enquiries,
          careers, and official office contacts.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="mailto:info@nestfoodsltd.com"
            className={buttonClassName({ variant: "primary" })}
          >
            Email Company
          </Link>
          <Link href="tel:+2347066898953" className={buttonClassName({ variant: "secondary" })}>
            Call Primary Line
          </Link>
          <Link
            href={WHATSAPP_LINKS.general}
            target="_blank"
            rel="noreferrer"
            className={buttonClassName({ variant: "brand" })}
          >
            Chat on WhatsApp
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <Card className="space-y-4">
          <p className="section-kicker">Official Contacts</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {CONTACT_CHANNELS.map((channel) => (
              <Link
                key={`${channel.label}-${channel.value}`}
                href={channel.href}
                className="rounded-[1.1rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 transition hover:border-[color:var(--border-strong)]"
              >
                <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                  {channel.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-neutral-900">{channel.value}</p>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <p className="section-kicker">WhatsApp</p>
          <div className="space-y-2">
            {[
              { label: "General", href: WHATSAPP_LINKS.general, number: "07066898953" },
              { label: "Sales", href: WHATSAPP_LINKS.sales, number: "08064107897" },
              { label: "HR", href: WHATSAPP_LINKS.hr, number: "09116337168" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="block text-sm font-medium text-neutral-700 transition hover:text-[color:var(--brand-1)]"
              >
                {item.label}: {item.number}
              </Link>
            ))}
          </div>
          <div className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
              Registered office
            </p>
            <p className="mt-2 text-sm leading-7 text-neutral-700">
              No 1 Nest Foods Limited, Okpuno, Awka
            </p>
          </div>
        </Card>
      </div>

      <Card className="space-y-4">
        <p className="section-kicker">Contact Locations</p>
        <Link
          href={HEAD_OFFICE_MAP_URL}
          className={buttonClassName({ variant: "secondary", size: "sm" })}
          target="_blank"
          rel="noreferrer"
        >
          Open Head Office Map
        </Link>
      </Card>

      <LocationFinder locations={BRANCH_LOCATIONS} />

      <Card className="space-y-4">
        <p className="section-kicker">Social Channels</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SOCIAL_CHANNELS.map((social) => (
            <Link
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-[1.1rem] border border-[color:var(--border)] bg-white px-4 py-3"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                {social.label}
              </p>
              <p className="mt-1 text-sm font-semibold text-neutral-900">{social.value}</p>
            </Link>
          ))}
        </div>
        <p className="text-xs leading-6 text-neutral-500">
          Other official handles are pending confirmation: {PENDING_SOCIAL_CHANNELS.join(", ")}.
        </p>
      </Card>

      <Card className="space-y-4">
        <p className="section-kicker">FAQ</p>
        <div className="grid gap-3 md:grid-cols-2">
          {SAFE_FAQS.map((item) => (
            <div
              key={item.question}
              className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4"
            >
              <h2 className="text-base font-semibold text-neutral-900">{item.question}</h2>
              <p className="mt-2 text-sm leading-7 text-neutral-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

export async function generateMetadata() {
  const page = await getCmsPage("contact", { preview: true });
  return cmsPageMetadata(page, { path: "/contact" });
}
