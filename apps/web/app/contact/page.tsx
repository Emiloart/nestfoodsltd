import Link from "next/link";

import { EnquiryCaptureForms } from "@/components/leads/enquiry-capture-forms";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/social-icons";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCompanyContent } from "@/lib/company/service";
import { cmsPageMetadata } from "@/lib/cms/metadata";
import { getCmsPage } from "@/lib/cms/service";
import { getCatalogueProductBySlug } from "@/lib/catalog/service";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

function ContactSocialIcon({ id, label }: { id: string; label: string }) {
  const socialName = `${id} ${label}`.toLowerCase();
  if (socialName.includes("instagram")) {
    return <InstagramIcon />;
  }

  return <FacebookIcon />;
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product: productSlug } = await searchParams;
  const selectedProduct = productSlug ? await getCatalogueProductBySlug(productSlug) : null;
  const [page, company] = await Promise.all([getCmsPage("contact"), getCompanyContent()]);
  const officialEmail = company.contactChannels.find((channel) =>
    channel.href.startsWith("mailto:"),
  );
  const primaryPhone = company.contactChannels.find((channel) => channel.href.startsWith("tel:"));
  const generalWhatsApp =
    company.whatsappContacts.find((contact) => contact.id === "general") ??
    company.whatsappContacts[0];
  const generalWhatsAppUrl = generalWhatsApp
    ? buildWhatsAppUrl(generalWhatsApp.phone, generalWhatsApp.message)
    : "/contact";

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
      <div className="section-frame px-5 py-7 sm:px-6 sm:py-8">
        <Badge>Contact</Badge>
        <h1 className="display-heading mt-4 text-4xl text-neutral-900 sm:text-5xl">
          {page.headline}
        </h1>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={officialEmail?.href ?? "mailto:info@nestfoodsltd.com"}
            className={buttonClassName({ variant: "primary" })}
          >
            Email Company
          </Link>
          <Link
            href={primaryPhone?.href ?? "tel:+2347066898953"}
            className={buttonClassName({ variant: "secondary" })}
          >
            Call Primary Line
          </Link>
          <Link
            href={generalWhatsAppUrl}
            target="_blank"
            rel="noreferrer"
            className={buttonClassName({ variant: "brand" })}
          >
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp
          </Link>
        </div>
      </div>

      <Card id="enquiry" className="scroll-mt-32 space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">Product enquiry</h2>
        <p className="text-sm leading-6 text-neutral-700">
          Ask about product supply or becoming a distributor. Our team will contact you to discuss
          your needs.
        </p>
        <EnquiryCaptureForms
          key={selectedProduct?.slug ?? "general"}
          initialProduct={selectedProduct?.name ?? ""}
        />
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4">
          <p className="section-kicker">Official Contacts</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {company.contactChannels.map((channel) => (
              <Link
                key={`${channel.label}-${channel.value}`}
                href={channel.href}
                className="rounded-[1.1rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 transition hover:border-[color:var(--border-strong)]"
              >
                <p className="text-xs uppercase tracking-[0.14em] text-neutral-700">
                  {channel.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-neutral-900">{channel.value}</p>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="space-y-3">
          <p className="section-kicker">WhatsApp Lines</p>
          {company.whatsappContacts.map((contact) => (
            <Link
              key={contact.id}
              href={buildWhatsAppUrl(contact.phone, contact.message)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-neutral-700 transition hover:text-[color:var(--brand-1)]"
            >
              <WhatsAppIcon />
              {contact.label}: {contact.phone}
            </Link>
          ))}
        </Card>
      </div>

      <div className="overflow-hidden rounded-[1.4rem] border border-[color:var(--border)] bg-white">
        <iframe
          title="Nest Foods Limited head office map"
          src={company.headOfficeEmbedMapUrl}
          className="h-[24rem] w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <Card className="space-y-4">
        <p className="section-kicker">Branch Contacts</p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {company.branchLocations.map((location) => (
            <div
              key={location.id}
              className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4"
            >
              <h2 className="text-base font-semibold text-neutral-900">{location.name}</h2>
              {location.address ? (
                <p className="mt-2 text-sm leading-6 text-neutral-600">{location.address}</p>
              ) : null}
              {location.phone ? (
                <Link
                  href={`tel:${location.phone.replace(/[^+\d]/g, "")}`}
                  className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-[color:var(--brand-1)]"
                >
                  Call {location.phone}
                </Link>
              ) : null}
              {location.hours ? (
                <p className="mt-2 text-xs leading-5 text-neutral-700">{location.hours}</p>
              ) : null}
              <Link
                href={location.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-[color:var(--brand-1)] transition hover:text-[color:var(--brand-2)]"
              >
                Open map
              </Link>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <p className="section-kicker">Social</p>
        <div className="flex flex-wrap gap-3">
          {company.socialChannels.map((social) => (
            <Link
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:border-[color:var(--border-strong)]"
            >
              <ContactSocialIcon id={social.id} label={social.label} />
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
