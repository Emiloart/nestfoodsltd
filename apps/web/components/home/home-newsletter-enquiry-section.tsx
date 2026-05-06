import { EnquiryCaptureForms } from "@/components/leads/enquiry-capture-forms";
import { NewsletterSignupForm } from "@/components/leads/newsletter-signup-form";
import { FadeIn } from "@/components/motion/fade-in";
import { Card } from "@/components/ui/card";

import { SectionHeading } from "./section-heading";

export function HomeNewsletterEnquirySection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:py-10">
      <SectionHeading
        eyebrow="Stay Connected"
        title="Product updates and enquiry capture in one focused section."
        description="Subscribe for De-Nest Bread updates or send a simple product supply enquiry for follow-up."
      />

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
        <FadeIn>
          <Card className="h-full space-y-4">
            <p className="section-kicker">Newsletter</p>
            <h3 className="text-2xl font-semibold text-neutral-900">
              Be first to know about De-Nest Bread product and company updates.
            </h3>
            <p className="text-sm leading-7 text-neutral-600">
              Nest Foods Limited may use this list for product announcements, branch updates, and
              company news. You can unsubscribe from future emails.
            </p>
            <NewsletterSignupForm />
          </Card>
        </FadeIn>

        <FadeIn delay={0.08}>
          <Card className="h-full space-y-4">
            <p className="section-kicker">Enquiry</p>
            <h3 className="text-2xl font-semibold text-neutral-900">
              Send product supply or distributor-interest details.
            </h3>
            <p className="text-sm leading-7 text-neutral-600">
              Submissions are treated as sales enquiries for follow-up through
              sales@nestfoodsltd.com context. This is a simple enquiry form only.
            </p>
            <EnquiryCaptureForms />
          </Card>
        </FadeIn>
      </div>
    </section>
  );
}
