import Link from "next/link";

import { SectionHeading } from "@/components/home/section-heading";
import { LocationFinder } from "@/components/locations/location-finder";
import { buttonClassName } from "@/components/ui/button";
import { BRANCH_LOCATIONS, WHATSAPP_LINKS } from "@/lib/company/contact";
import { type CmsPage } from "@/lib/cms/types";

type HomeContactSectionProps = {
  contactPage: CmsPage;
};

const contactBlocks = [
  {
    title: "Office Details",
    value: "Head office and branch contact details are published with phone numbers and hours.",
  },
  {
    title: "Email",
    value: "General product, company, and careers enquiries route through the central team.",
  },
  {
    title: "Phone",
    value: "Primary phone and WhatsApp contact routes are available for direct follow-up.",
  },
  {
    title: "Visits",
    value: "Meetings, site visits, and follow-up discussions can be coordinated in advance.",
  },
];

export function HomeContactSection({ contactPage }: HomeContactSectionProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 lg:py-9">
      <div className="section-frame px-5 py-5 sm:px-6">
        <SectionHeading
          eyebrow="Contact"
          title="Reach Nest Foods Limited."
          description={contactPage.description}
          descriptionClassName="hidden md:block"
          actions={
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className={buttonClassName({ variant: "primary" })}>
                Contact Nest Foods Limited
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
          }
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            {contactBlocks.map((block) => (
              <div
                key={block.title}
                className="rounded-[1.3rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-5 py-5"
              >
                <p className="section-kicker">{block.title}</p>
                <p className="pretty-text mt-3 text-sm leading-7 text-neutral-700">{block.value}</p>
              </div>
            ))}
          </div>

          <LocationFinder locations={BRANCH_LOCATIONS.slice(0, 5)} />
        </div>
      </div>
    </section>
  );
}
