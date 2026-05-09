import Link from "next/link";

import { EnquiryCaptureForms } from "@/components/leads/enquiry-capture-forms";
import { FacebookIcon, WhatsAppIcon } from "@/components/social-icons";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BRANCH_LOCATIONS,
  CONTACT_CHANNELS,
  HEAD_OFFICE_EMBED_MAP_URL,
  SOCIAL_CHANNELS,
  WHATSAPP_LINKS,
} from "@/lib/company/contact";
import { cmsPageMetadata } from "@/lib/cms/metadata";
import { getCmsPage } from "@/lib/cms/service";

export default async function ContactPage() {
  const page = await getCmsPage("contact");

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
      <div className="section-frame px-5 py-7 sm:px-6 sm:py-8">
        <Badge>Contact</Badge>
        <h1 className="display-heading mt-4 text-4xl text-neutral-900 sm:text-5xl">
          {page.headline}
        </h1>
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
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
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

        <Card className="space-y-3">
          <p className="section-kicker">WhatsApp Lines</p>
          <Link
            href={WHATSAPP_LINKS.general}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-neutral-700 transition hover:text-[color:var(--brand-1)]"
          >
            <WhatsAppIcon />
            General: 07066898953
          </Link>
          <Link
            href={WHATSAPP_LINKS.sales}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-neutral-700 transition hover:text-[color:var(--brand-1)]"
          >
            <WhatsAppIcon />
            Sales: 08064107897
          </Link>
          <Link
            href={WHATSAPP_LINKS.hr}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-neutral-700 transition hover:text-[color:var(--brand-1)]"
          >
            <WhatsAppIcon />
            HR: 09116337168
          </Link>
        </Card>
      </div>

      <div className="overflow-hidden rounded-[1.4rem] border border-[color:var(--border)] bg-white">
        <iframe
          title="Nest Foods Limited head office map"
          src={HEAD_OFFICE_EMBED_MAP_URL}
          className="h-[24rem] w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <Card className="space-y-4">
        <p className="section-kicker">Branch Contacts</p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {BRANCH_LOCATIONS.map((location) => (
            <div
              key={location.id}
              className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4"
            >
              <h2 className="text-base font-semibold text-neutral-900">{location.name}</h2>
              {location.address ? (
                <p className="mt-2 text-sm leading-6 text-neutral-600">{location.address}</p>
              ) : null}
              {location.phone ? (
                <p className="mt-3 text-xs font-semibold text-neutral-500">{location.phone}</p>
              ) : null}
              {location.hours ? (
                <p className="mt-2 text-xs leading-5 text-neutral-500">{location.hours}</p>
              ) : null}
              <Link
                href={location.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex text-xs font-semibold text-[color:var(--brand-1)] transition hover:text-[color:var(--brand-2)]"
              >
                Open map
              </Link>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <p className="section-kicker">Product Enquiry</p>
        <EnquiryCaptureForms />
      </Card>

      <Card className="space-y-4">
        <p className="section-kicker">Social</p>
        <div className="flex flex-wrap gap-3">
          {SOCIAL_CHANNELS.map((social) => (
            <Link
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:border-[color:var(--border-strong)]"
            >
              <FacebookIcon />
              {social.label}
            </Link>
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
