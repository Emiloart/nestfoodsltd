import { NewsletterSignupForm } from "@/components/leads/newsletter-signup-form";
import { Card } from "@/components/ui/card";

export function HomeNewsletterEnquirySection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:py-9">
      <Card className="mx-auto max-w-2xl space-y-3">
        <p className="section-kicker">Newsletter</p>
        <h3 className="text-2xl font-semibold text-neutral-900">Get De-Nest Bread updates.</h3>
        <NewsletterSignupForm />
      </Card>
    </section>
  );
}
