import { type Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { Card } from "@/components/ui/card";
import { getBlogArticleBySlug, listBlogArticles } from "@/lib/blog/articles";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildArticleStructuredData } from "@/lib/seo/structured-data";

type BlogArticlePageProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

export async function generateStaticParams() {
  return listBlogArticles().map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await Promise.resolve(params);
  const article = getBlogArticleBySlug(slug);

  if (!article) {
    return buildPageMetadata({
      title: "Article Not Found",
      description: "The requested article could not be found.",
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: article.title,
    description: article.summary,
    path: `/blog/${article.slug}`,
    ogImageUrl: article.imageUrl,
    openGraphType: "article",
  });
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await Promise.resolve(params);
  const article = getBlogArticleBySlug(slug);

  if (!article) {
    notFound();
    return null;
  }

  const articleStructuredData = buildArticleStructuredData({
    headline: article.title,
    description: article.summary,
    path: `/blog/${article.slug}`,
    imageUrl: article.imageUrl,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
  });

  return (
    <section className="mx-auto w-full max-w-4xl space-y-8 px-4 py-16 md:px-6">
      <JsonLd id={`article-${article.slug}-ld`} data={articleStructuredData} />
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
          Published{" "}
          {new Date(article.publishedAt).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          {article.title}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">{article.summary}</p>
      </header>

      <article className="space-y-4">
        {article.sections.map((section) => (
          <Card key={section.heading} className="space-y-2">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {section.heading}
            </h2>
            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              {section.body}
            </p>
          </Card>
        ))}
      </article>
    </section>
  );
}
