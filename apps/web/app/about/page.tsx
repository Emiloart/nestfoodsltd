import { CompanyFaqSection } from "@/components/company/company-faq-section";
import { CompanyStoryCarousel } from "@/components/company/company-story-carousel";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCompanyContent } from "@/lib/company/service";
import { cmsPageMetadata } from "@/lib/cms/metadata";
import { getCmsPage } from "@/lib/cms/service";

export default async function AboutPage() {
  const [page, company] = await Promise.all([getCmsPage("about"), getCompanyContent()]);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 md:px-6">
      <div className="section-frame px-5 py-7 sm:px-6 sm:py-8">
        <Badge>About Nest Foods Limited</Badge>
        <h1 className="display-heading mt-4 text-4xl text-neutral-900 sm:text-5xl">
          {page.headline}
        </h1>
      </div>

      <CompanyStoryCarousel company={company} showAboutLink={false} />

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="space-y-3">
          <p className="section-kicker">Milestones</p>
          <ul className="space-y-3 text-sm text-neutral-700">
            {company.milestones.map((item) => (
              <li key={item.title}>
                <span className="font-semibold text-neutral-900">{item.title}:</span> {item.body}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="space-y-3">
          <p className="section-kicker">Certifications & Compliance</p>
          <div className="divide-y divide-[color:var(--border)]">
            {company.certifications.map((item) => (
              <article key={item.title} className="py-4 first:pt-0 last:pb-0">
                <h2 className="text-base font-semibold text-neutral-900">{item.title}</h2>
                <p className="pretty-text mt-2 text-sm leading-7 text-neutral-600">{item.body}</p>
              </article>
            ))}
          </div>
        </Card>
      </div>

      <CompanyFaqSection faqs={company.faqs} />
    </section>
  );
}

export async function generateMetadata() {
  const page = await getCmsPage("about", { preview: true });
  return cmsPageMetadata(page, { path: "/about" });
}
