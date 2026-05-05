import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cmsPageMetadata } from "@/lib/cms/metadata";
import { getCmsPage } from "@/lib/cms/service";

const values = [
  {
    title: "Quality First",
    body: "Ensuring every loaf of De-Nest Family bread meets top standards.",
  },
  {
    title: "Integrity",
    body: "Upholding honesty and accountability in all operations.",
  },
  {
    title: "Customer Focus",
    body: "Delivering satisfaction through consistent product excellence.",
  },
  {
    title: "Innovation",
    body: "Improving baking techniques and product presentation.",
  },
  {
    title: "Consistency",
    body: "Maintaining uniform taste, quality, and premium service delivery across the company.",
  },
  {
    title: "Teamwork",
    body: "Building a strong and dedicated workforce.",
  },
];

const pillars = [
  {
    title: "Mission",
    body: "To produce baked products and confectioneries under the most hygienic conditions with best natural ingredients for human nourishment.",
  },
  {
    title: "Vision",
    body: "To become the leading company in bakery and confectioneries industry.",
  },
];

export default async function VisionPage() {
  const page = await getCmsPage("vision");

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 md:px-6">
      <div className="section-frame px-5 py-7 sm:px-6 sm:py-8">
        <Badge>Vision & Mission</Badge>
        <h1 className="display-heading mt-4 text-4xl text-neutral-900 sm:text-5xl">
          {page.headline}
        </h1>
        <p className="pretty-text mt-4 max-w-3xl text-[0.98rem] leading-7 text-neutral-600">
          {page.description}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {pillars.map((pillar) => (
          <Card key={pillar.title} className="space-y-3">
            <p className="section-kicker">{pillar.title}</p>
            <p className="text-sm leading-7 text-neutral-700">{pillar.body}</p>
          </Card>
        ))}
      </div>

      <Card className="space-y-4">
        <p className="section-kicker">Core Values</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-[1.1rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3"
            >
              <h2 className="text-sm font-semibold text-neutral-900">{value.title}</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{value.body}</p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

export async function generateMetadata() {
  const page = await getCmsPage("vision", { preview: true });
  return cmsPageMetadata(page, { path: "/vision" });
}
