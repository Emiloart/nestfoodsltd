import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { listBlogArticles } from "@/lib/blog/articles";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildArticleStructuredData } from "@/lib/seo/structured-data";

const articles = listBlogArticles();

export const metadata = buildPageMetadata({
  title: "Blog",
  description:
    "Enterprise insights on food commerce operations, UX quality, and traceability standards.",
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
        <Badge>Editorial</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Blog
        </h1>
        <p className="max-w-3xl text-sm text-neutral-600 dark:text-neutral-300">
          News, operations updates, and growth strategy content for Nest Foods Ltd customers and
          distributors.
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
                  className="rounded-full border border-neutral-200 px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
                >
                  {tag}
                </span>
              ))}
            </div>
            <Link
              href={`/blog/${article.slug}`}
              className="inline-flex h-10 items-center rounded-full border border-neutral-300 px-4 text-xs font-medium uppercase tracking-[0.14em] text-neutral-800 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-900"
            >
              Read Article
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}
