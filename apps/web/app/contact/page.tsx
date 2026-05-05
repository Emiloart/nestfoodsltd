import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cmsPageMetadata } from "@/lib/cms/metadata";
import { getCmsPage } from "@/lib/cms/service";

const contactChannels = [
  { label: "Primary phone", value: "07066898953", href: "tel:+2347066898953" },
  { label: "Secondary phone", value: "08064107897", href: "tel:+2348064107897" },
  { label: "Secondary phone", value: "09116337168", href: "tel:+2349116337168" },
  { label: "Official email", value: "info@nestfoodsltd.com", href: "mailto:info@nestfoodsltd.com" },
  { label: "Product email", value: "sales@nestfoodsltd.com", href: "mailto:sales@nestfoodsltd.com" },
  { label: "HR email", value: "hrsupport@nestfoodsltd.com", href: "mailto:hrsupport@nestfoodsltd.com" },
  {
    label: "Admin email",
    value: "adminsupport@nestfoodsltd.com",
    href: "mailto:adminsupport@nestfoodsltd.com",
  },
];

const whatsappNumbers = ["07066898953", "08064107897", "09116337168"];

const locations = [
  {
    name: "Awka Head Office",
    address: "No. 1 Nest Foods Street, Okochime Okpuno, Awka South, Anambra State",
    phone: "07066898953, 08064107897",
    hours: "Mondays - Saturdays: 24 hours. Sundays: 6am - 12pm as scheduled.",
  },
  {
    name: "Port Harcourt Contact Location",
    address: "No. 14 Old Refinery Road, Elelenwo, Port Harcourt, Rivers State",
    phone: "08114549026",
    hours: "Mondays - Saturdays: 6am - 6pm.",
  },
  {
    name: "Owerri Contact Location",
    address: "No. 20A Mbonu Ojike Street, Ikenegbu, Owerri, Imo State",
    phone: "09165407850",
    hours: "Mondays - Saturdays: 6am - 6pm.",
  },
  {
    name: "Umuahia Contact Location",
    address: "No. 1 Club Road by Okpara Square Roundabout, Umuahia, Abia State",
    phone: "07077746092",
    hours: "Mondays - Saturdays: 6am - 6pm.",
  },
  {
    name: "Benin Contact Location",
    address: "No. 1 Uwa Lane off Wire Road, Benin City, Edo State",
    phone: "08125927131",
    hours: "Mondays - Saturdays: 6am - 6pm.",
  },
  {
    name: "Aba Contact Location",
    address: "Port Harcourt Road Area",
    phone: "Contact head office for details",
    hours: "Mondays - Saturdays: 6am - 6pm.",
  },
  {
    name: "Akwa-Ibom Contact Location",
    address: "Contact head office for details",
    phone: "Contact head office for details",
    hours: "Mondays - Saturdays: 6am - 6pm.",
  },
];

const confirmedSocials = [{ label: "Facebook", value: "nest foods limited" }];
const pendingSocials = ["X", "Instagram", "TikTok", "YouTube", "LinkedIn"];
const headOfficeMapUrl =
  "https://www.google.com/maps/search/?api=1&query=No.%201%20Nest%20Foods%20Street%20Okochime%20Okpuno%20Awka%20South%20Anambra%20State";

export default async function ContactPage() {
  const page = await getCmsPage("contact");

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 md:px-6">
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
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <Card className="space-y-4">
          <p className="section-kicker">Official Contacts</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {contactChannels.map((channel) => (
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
            {whatsappNumbers.map((number) => (
              <Link
                key={number}
                href={`https://wa.me/234${number.slice(1)}`}
                className="block text-sm font-medium text-neutral-700 transition hover:text-[color:var(--brand-1)]"
              >
                {number}
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
          href={headOfficeMapUrl}
          className={buttonClassName({ variant: "secondary", size: "sm" })}
          target="_blank"
          rel="noreferrer"
        >
          Open Head Office Map
        </Link>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {locations.map((location) => (
            <div
              key={location.name}
              className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4"
            >
              <h2 className="text-base font-semibold text-neutral-900">{location.name}</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{location.address}</p>
              <p className="mt-3 text-xs font-semibold text-neutral-500">{location.phone}</p>
              <p className="mt-2 text-xs leading-5 text-neutral-500">{location.hours}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <p className="section-kicker">Social Channels</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {confirmedSocials.map((social) => (
            <div
              key={social.label}
              className="rounded-[1.1rem] border border-[color:var(--border)] bg-white px-4 py-3"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                {social.label}
              </p>
              <p className="mt-1 text-sm font-semibold text-neutral-900">{social.value}</p>
            </div>
          ))}
        </div>
        <p className="text-xs leading-6 text-neutral-500">
          Pending official handles: {pendingSocials.join(", ")}. These will be published only after
          confirmation.
        </p>
      </Card>
    </section>
  );
}

export async function generateMetadata() {
  const page = await getCmsPage("contact", { preview: true });
  return cmsPageMetadata(page, { path: "/contact" });
}
