import type { MetadataRoute } from "next";
import { listCatalogueProducts } from "@/lib/catalog/service";
import { readCmsData } from "@/lib/cms/store";
import { absoluteUrl } from "@/lib/seo/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, cms] = await Promise.all([listCatalogueProducts(), readCmsData()]);
  const pageDates: Record<string, string | undefined> = {
    "/": cms.pages.home.updatedAt,
    "/about": cms.pages.about.updatedAt,
    "/contact": cms.pages.contact.updatedAt,
    "/careers": cms.pages.careers.updatedAt,
  };
  function validDate(value?: string) {
    return value && !Number.isNaN(Date.parse(value)) ? new Date(value) : undefined;
  }
  const staticEntries: MetadataRoute.Sitemap = [
    "/",
    "/about",
    "/products",
    "/contact",
    "/careers",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: absoluteUrl(route),
    lastModified: validDate(pageDates[route]),
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.8,
  }));
  return [
    ...staticEntries,
    ...products.map((product) => ({
      url: absoluteUrl(`/products/${product.slug}`),
      lastModified: validDate(product.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
  ];
}
