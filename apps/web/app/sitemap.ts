import type { MetadataRoute } from "next";

import { listCommerceProducts } from "@/lib/commerce/service";
import { absoluteUrl } from "@/lib/seo/site";

const staticRoutes = [
  "",
  "/about",
  "/vision",
  "/shop",
  "/contact",
  "/careers",
  "/privacy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products] = await Promise.all([listCommerceProducts()]);
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

  return [...staticEntries, ...productEntries].map((entry) => {
    const normalizedLastModified =
      entry.lastModified instanceof Date
        ? entry.lastModified
        : entry.lastModified
          ? new Date(entry.lastModified)
          : now;

    return {
      ...entry,
      lastModified: Number.isNaN(normalizedLastModified.getTime()) ? now : normalizedLastModified,
    };
  });
}
