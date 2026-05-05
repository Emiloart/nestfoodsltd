import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cmsPageMetadata } from "@/lib/cms/metadata";
import { getCmsPage } from "@/lib/cms/service";

const milestones = [
  "Foundation by Mr. Obinna Paulinus Nwosu",
  "Launch of the De-Nest Bread family range",
  "Growth in production capacity and company operations",
  "Brand recognition and regulatory compliance",
  "Ongoing investment in people, quality, and community value",
];

const standards = [
  "Food safety and hygiene standards",
  "NAFDAC registered",
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
        <p className="pretty-text mt-4 max-w-3xl text-[0.98rem] leading-7 text-neutral-600">
          Nest Foods Limited is the company behind De-Nest Bread. Incorporated on 18 November
          2022, the company operates from Awka, Anambra State with a focus on hygienic production,
          selected ingredients, and affordable quality bakery products.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <Card className="space-y-4">
          <p className="section-kicker">Company Story</p>
          <p className="pretty-text text-sm leading-7 text-neutral-700">
            De-Nest Bread is positioned as a dependable bread brand for everyday Nigerian homes,
            workplaces, and refreshment moments. Every loaf reflects the company commitment to
            quality, clean production, and consistent taste.
          </p>
          <div className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Motto</p>
            <p className="mt-2 text-lg font-semibold text-neutral-900">
              Baking memories, one slice at a time.
            </p>
          </div>
        </Card>

        <Card className="space-y-3">
          <p className="section-kicker">Founder</p>
          <h2 className="text-2xl font-semibold text-neutral-900">Mr. Obinna Paulinus Nwosu</h2>
          <p className="text-sm leading-7 text-neutral-600">
            Founder of Nest Foods Limited and the De-Nest Bread brand.
          </p>
          <p className="text-xs text-neutral-500">RC: 2001646</p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3">
          <p className="section-kicker">Milestones</p>
          <ul className="space-y-2 text-sm text-neutral-700">
            {milestones.map((item) => (
              <li key={item}>• {item}</li>
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
    </section>
  );
}

export async function generateMetadata() {
  const page = await getCmsPage("about", { preview: true });
  return cmsPageMetadata(page, { path: "/about" });
}
