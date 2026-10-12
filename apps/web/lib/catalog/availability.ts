import type { CatalogueProduct } from "./types";

export function isProductComingSoon(product: CatalogueProduct) {
  if (product.availability) return product.availability === "coming-soon";
  return /coming[\s_-]*soon/i.test(
    `${product.shortDescription} ${product.longDescription} ${product.imageUrl}`,
  );
}
