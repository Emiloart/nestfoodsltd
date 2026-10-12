import { type CompanyContent } from "@/lib/company/types";
import { Card } from "@/components/ui/card";

export function CompanyStory({ company }: { company: CompanyContent }) {
  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <h2 className="text-2xl font-bold text-neutral-900">Our story</h2>
        {company.story.map((paragraph) => (
          <p key={paragraph} className="max-w-4xl text-base leading-8 text-neutral-700">
            {paragraph}
          </p>
        ))}
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { title: "Our vision", body: company.vision },
          { title: "Our mission", body: company.mission },
        ].map((item) => (
          <Card key={item.title} className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">{item.title}</h2>
            <p className="text-base leading-8 text-neutral-700">{item.body}</p>
          </Card>
        ))}
      </div>
      <Card className="space-y-4">
        <h2 className="text-2xl font-bold text-neutral-900">Founder story</h2>
        {company.founderStory.map((paragraph) => (
          <p key={paragraph} className="max-w-4xl text-base leading-8 text-neutral-700">
            {paragraph}
          </p>
        ))}
      </Card>
      <Card className="space-y-5">
        <h2 className="text-2xl font-bold text-neutral-900">Our values</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {company.coreValues.map((value) => (
            <article key={value.title}>
              <h3 className="text-base font-bold text-neutral-900">{value.title}</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">{value.body}</p>
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}
