import type { MetadataRoute } from "next";

import { listBlogArticles } from "@/lib/blog/articles";
import { listCommerceProducts } from "@/lib/commerce/service";
import { absoluteUrl } from "@/lib/seo/site";

const staticRoutes = [
  "",
  "/about",
  "/vision",
  "/shop",
  "/recipes",
  "/blog",
  "/contact",
  "/traceability",
  "/b2b",
  "/careers",
  "/sustainability",
  "/privacy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products] = await Promise.all([listCommerceProducts()]);
  const articles = listBlogArticles();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: absoluteUrl(route || "/"),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/products/${product.slug}`),
    lastModified: new Date(product.updatedAt),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: absoluteUrl(`/blog/${article.slug}`),
    lastModified: new Date(article.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...productEntries, ...articleEntries].map((entry) => ({
    ...entry,
    lastModified: Number.isNaN(entry.lastModified.getTime()) ? now : entry.lastModified,
  }));
}
