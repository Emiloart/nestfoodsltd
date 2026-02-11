import type { MetadataRoute } from "next";

const routes = [
  "",
  "/about",
  "/vision",
  "/shop",
  "/recipes",
  "/blog",
  "/contact",
  "/traceability",
  "/b2b",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://nestfoodsltd.com";

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
