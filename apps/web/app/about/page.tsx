import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cmsPageMetadata } from "@/lib/cms/metadata";
import { getCmsPage } from "@/lib/cms/service";

const companyStory = [
  "Nest Foods Limited Awka is a Nigerian bakery located in Awka. The company was established in 2022 to meet the growing demand for locally produced, affordable, rich, and quality bakery products across Nigeria and beyond.",
  "From its early beginnings as a large-scale food business, Nest Foods Limited focused on processing and packaging staple bakery products tailored to various tastes, dietary needs, and budgets. Its flagship product is De-Nest family bread, produced in different varieties and sizes.",
  "Through consistent investment in modern baking practices, quality control, and operational discipline, the company has gradually expanded its production capacity and market reach.",
  "Today, Nest Foods Limited continues to grow in the bakery industry while maintaining its commitment to quality, food safety practices, affordability, service excellence, employment creation, and local economic development.",
];

const milestones = [
  {
    title: "Foundation",
    body: "Establishment of Nest Foods Limited by Mr. Obinna Paulinus Nwosu.",
  },
  {
    title: "Product Launch",
    body: "Introduction of De-Nest family bread into the local market after pre-launch regulatory activities.",
  },
  {
    title: "Growth Phase",
    body: "Radical marketing and gradual expansion of production capacity and market reach.",
  },
  {
    title: "Brand Recognition and Regulation",
    body: "Acceptance of De-Nest family bread as a trusted household consumable in adherence to food regulatory oversight.",
  },
  {
    title: "National Expansion",
    body: "Growth of De-Nest family bread awareness across multiple states in Nigeria.",
  },
  {
    title: "Awards and Community Development",
    body: "Recognition across food industry bodies and public/private institutions for food safety commitment, philanthropic acts, and community development services.",
  },
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
          {companyStory.map((paragraph) => (
            <p key={paragraph} className="pretty-text text-sm leading-7 text-neutral-700">
              {paragraph}
            </p>
          ))}
          <div className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Motto</p>
            <p className="mt-2 text-lg font-semibold text-neutral-900">
              Baking memories, one slice at a time.
            </p>
            <p className="mt-2 text-sm font-semibold text-neutral-700">
              Every loaf is a testament of our commitment to quality.
            </p>
          </div>
        </Card>

        <Card className="space-y-3">
          <p className="section-kicker">Founder</p>
          <h2 className="text-2xl font-semibold text-neutral-900">Mr. Obinna Paulinus Nwosu</h2>
          <p className="text-sm leading-7 text-neutral-600">
            Mr. Obinna Paulinus Nwosu is the visionary founder and driving force behind Nest
            Foods Limited. With a strong entrepreneurial spirit and deep understanding of the
            Nigerian food industry, he established the company with the goal of providing
            high-quality, affordable bread to everyday consumers.
          </p>
          <p className="text-sm leading-7 text-neutral-600">
            Under his leadership, Nest Foods Limited has grown from a state bakery into a
            nationally competitive brand known as De-Nest family bread. His commitment to quality,
            excellence, innovation, and customer satisfaction continues to guide the company.
          </p>
          <p className="text-xs text-neutral-500">RC: 2001646</p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3">
          <p className="section-kicker">Milestones</p>
          <ul className="space-y-3 text-sm text-neutral-700">
            {milestones.map((item) => (
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
    </section>
  );
}

export async function generateMetadata() {
  const page = await getCmsPage("about", { preview: true });
  return cmsPageMetadata(page, { path: "/about" });
}
