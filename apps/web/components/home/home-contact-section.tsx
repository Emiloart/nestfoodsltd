import Link from "next/link";

import { MockPanel } from "@/components/home/mock-panel";
import { SectionHeading } from "@/components/home/section-heading";
import { buttonClassName } from "@/components/ui/button";
import { type CmsPage } from "@/lib/cms/types";

type HomeContactSectionProps = {
  contactPage: CmsPage;
};

const contactBlocks = [
  {
    title: "Office Details",
    value: "Head office and facility contact details are available on the contact page.",
  },
  {
    title: "Email",
    value: "General product, company, and careers enquiries route through the central team.",
  },
  {
    title: "Phone",
    value: "Primary phone support remains available during published business hours.",
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
          title="Reach Nest Foods."
          description={contactPage.description}
          descriptionClassName="hidden md:block"
          actions={
            <Link href="/contact" className={buttonClassName({ variant: "primary" })}>
              Contact Nest Foods
            </Link>
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

          <MockPanel
            label="Location Overview"
            title="Facility and office access"
            description="Map, route, and access details can be published here when available."
            descriptionClassName="hidden md:block"
          >
            <div className="grid gap-3">
              <div className="h-48 rounded-[1.3rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)]" />
              <div className="grid gap-3 sm:grid-cols-3">
                {["Production site", "Distribution route", "Office access"].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-4"
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Area</p>
                    <p className="mt-2 text-sm font-medium text-neutral-900">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </MockPanel>
        </div>
      </div>
    </section>
  );
}
