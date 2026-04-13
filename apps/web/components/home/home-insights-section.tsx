import Link from "next/link";

import { MockPanel } from "@/components/home/mock-panel";
import { SectionHeading } from "@/components/home/section-heading";
import { Card } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { type BlogArticle } from "@/lib/blog/articles";

type HomeInsightsSectionProps = {
  articles: BlogArticle[];
};

export function HomeInsightsSection({ articles }: HomeInsightsSectionProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <SectionHeading
        eyebrow="Insights & Bread Ideas"
        title="Editorial credibility without turning the site into a content portal."
        description="Preserve the existing blog and recipe routes, but present them as light supporting content around ingredients, quality, and bread usage."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <MockPanel
          label="Bread Ideas"
          title="Ingredients, usage ideas, and product context"
          description="Placeholder surface for ingredient storytelling, bread usage ideas, and light recipe support."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {["Wheat Flour", "Yeast", "Salt", "Butter Notes"].map((item) => (
              <div
                key={item}
                className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-4"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                  Ingredient
                </p>
                <p className="mt-2 text-sm font-medium text-neutral-900">
                  {item}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/recipes"
              className={buttonClassName({ variant: "primary" })}
            >
              Open Bread Ideas
            </Link>
            <Link
              href="/blog"
              className={buttonClassName({ variant: "secondary" })}
            >
              Read Insights
            </Link>
          </div>
        </MockPanel>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {articles.slice(0, 3).map((article) => (
            <Card key={article.slug} className="space-y-4">
              <div>
                <p className="section-kicker">Insight</p>
                <h3 className="mt-3 text-xl font-semibold text-neutral-900">
                  {article.title}
                </h3>
                <p className="pretty-text mt-3 text-sm leading-7 text-neutral-600">
                  {article.summary}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[color:var(--border)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-neutral-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href={`/blog/${article.slug}`}
                className={buttonClassName({ variant: "secondary", size: "sm" })}
              >
                Read Insight
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
