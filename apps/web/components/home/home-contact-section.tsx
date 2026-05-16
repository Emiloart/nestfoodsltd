import Link from "next/link";

import { SectionHeading } from "@/components/home/section-heading";
import { WhatsAppIcon } from "@/components/social-icons";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type CompanyContent } from "@/lib/company/types";
import { type CmsPage } from "@/lib/cms/types";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type HomeContactSectionProps = {
  contactPage: CmsPage;
  company: CompanyContent;
};

export function HomeContactSection({ contactPage, company }: HomeContactSectionProps) {
  const phones = company.contactChannels.filter((channel) => channel.href.startsWith("tel:"));
  const emails = company.contactChannels.filter((channel) => channel.href.startsWith("mailto:"));
  const headOffice = company.branchLocations[0];
  const generalWhatsApp = company.whatsappContacts.find((contact) => contact.id === "general") ??
    company.whatsappContacts[0];
  const generalWhatsAppUrl = generalWhatsApp
    ? buildWhatsAppUrl(generalWhatsApp.phone, generalWhatsApp.message)
    : "/contact";

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
                Contact Page
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
          }
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="space-y-2 p-4">
              <p className="section-kicker">Phone</p>
              {phones.slice(0, 3).map((phone, index) => (
                <p
                  key={phone.href}
                  className={index === 0 ? "text-sm font-semibold text-neutral-900" : "text-sm text-neutral-700"}
                >
                  {phone.value}
                </p>
              ))}
            </Card>
            <Card className="space-y-2 p-4">
              <p className="section-kicker">Email</p>
              {emails.slice(0, 3).map((email, index) => (
                <p
                  key={email.href}
                  className={index === 0 ? "text-sm font-semibold text-neutral-900" : "text-sm text-neutral-700"}
                >
                  {email.value}
                </p>
              ))}
            </Card>
            <Card className="space-y-2 p-4 sm:col-span-2">
              <p className="section-kicker">Head Office</p>
              <p className="text-sm text-neutral-700">
                {headOffice?.address ?? "Nest Foods Limited, Awka, Anambra State"}
              </p>
            </Card>
          </div>

          <div className="overflow-hidden rounded-[1.3rem] border border-[color:var(--border)] bg-white">
            <iframe
              title="Nest Foods Limited head office map"
              src={company.headOfficeEmbedMapUrl}
              className="h-[18rem] w-full md:h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
