import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listBlogArticles } from "@/lib/blog/articles";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildArticleStructuredData } from "@/lib/seo/structured-data";

const articles = listBlogArticles();

export const metadata = buildPageMetadata({
  title: "Insights",
  description:
    "Corporate insights on bread production, quality systems, traceability discipline, and product stewardship.",
  path: "/blog",
  openGraphType: "website",
});

export default function BlogPage() {
  const articleStructuredData = articles.map((article) =>
    buildArticleStructuredData({
      headline: article.title,
      description: article.summary,
      path: `/blog/${article.slug}`,
      imageUrl: article.imageUrl,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
    }),
  );

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 md:px-6">
      <JsonLd id="blog-articles-ld" data={articleStructuredData} />
      <div className="space-y-3">
        <Badge>Insights</Badge>
        <h1 className="display-heading text-4xl text-neutral-900 dark:text-neutral-100 sm:text-[3.15rem]">
          Operational Insights
        </h1>
        <p className="max-w-3xl text-sm text-neutral-600 dark:text-neutral-300">
          Updates from Nest Foods on manufacturing quality, bread category development, and
          traceability.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <Card key={article.slug} className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">
                {new Date(article.publishedAt).toLocaleDateString("en-NG", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {article.title}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">{article.summary}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-neutral-600 dark:text-neutral-300"
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
    </section>
  );
}
