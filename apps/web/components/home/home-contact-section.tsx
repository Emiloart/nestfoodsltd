import Link from "next/link";

import { SectionHeading } from "@/components/home/section-heading";
import { WhatsAppIcon } from "@/components/social-icons";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HEAD_OFFICE_EMBED_MAP_URL, WHATSAPP_LINKS } from "@/lib/company/contact";
import { type CmsPage } from "@/lib/cms/types";

type HomeContactSectionProps = {
  contactPage: CmsPage;
};

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
                Contact Page
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
          }
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="space-y-2 p-4">
              <p className="section-kicker">Phone</p>
              <p className="text-sm font-semibold text-neutral-900">07066898953</p>
              <p className="text-sm text-neutral-700">08064107897</p>
              <p className="text-sm text-neutral-700">09116337168</p>
            </Card>
            <Card className="space-y-2 p-4">
              <p className="section-kicker">Email</p>
              <p className="text-sm font-semibold text-neutral-900">info@nestfoodsltd.com</p>
              <p className="text-sm text-neutral-700">sales@nestfoodsltd.com</p>
              <p className="text-sm text-neutral-700">hrsupport@nestfoodsltd.com</p>
            </Card>
            <Card className="space-y-2 p-4 sm:col-span-2">
              <p className="section-kicker">Head Office</p>
              <p className="text-sm text-neutral-700">
                No. 1 Nest Foods Street, Okochime Okpuno, Awka South, Anambra State
              </p>
            </Card>
          </div>

          <div className="overflow-hidden rounded-[1.3rem] border border-[color:var(--border)] bg-white">
            <iframe
              title="Nest Foods Limited head office map"
              src={HEAD_OFFICE_EMBED_MAP_URL}
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
