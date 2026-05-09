import { CompanyFaqSection } from "@/components/company/company-faq-section";
import { CompanyStoryCarousel } from "@/components/company/company-story-carousel";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { COMPANY_MILESTONES } from "@/lib/company/about";
import { cmsPageMetadata } from "@/lib/cms/metadata";
import { getCmsPage } from "@/lib/cms/service";

const standards = [
  "Food safety and hygiene standards",
  "NAFDAC REG: ANO1T2BAWK",
  "SON certification focus",
  "NESREA environmental compliance",
  "Quality control from raw materials to baking and packaging",
];

export default async function AboutPage() {
  const page = await getCmsPage("about");

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 md:px-6">
      <div className="section-frame px-5 py-7 sm:px-6 sm:py-8">
        <Badge>About Nest Foods Limited</Badge>
        <h1 className="display-heading mt-4 text-4xl text-neutral-900 sm:text-5xl">
          {page.headline}
        </h1>
      </div>

      <CompanyStoryCarousel />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3">
          <p className="section-kicker">Milestones</p>
          <ul className="space-y-3 text-sm text-neutral-700">
            {COMPANY_MILESTONES.map((item) => (
              <li key={item.title}>
                <span className="font-semibold text-neutral-900">{item.title}:</span> {item.body}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="space-y-3">
          <p className="section-kicker">Production Standards</p>
          <ul className="space-y-2 text-sm text-neutral-700">
            {standards.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </Card>
      </div>

      <CompanyFaqSection />
    </section>
  );
}

export async function generateMetadata() {
  const page = await getCmsPage("about", { preview: true });
  return cmsPageMetadata(page, { path: "/about" });
}
