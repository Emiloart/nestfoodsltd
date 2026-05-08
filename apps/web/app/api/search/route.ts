import { NextRequest, NextResponse } from "next/server";

import { listCatalogueFacets, listCatalogueProducts } from "@/lib/catalog/service";

type SearchSuggestion = {
  id: string;
  type: "product" | "category";
  title: string;
  subtitle?: string;
  href: string;
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const [products, facets] = await Promise.all([
    listCatalogueProducts({ search: query }),
    listCatalogueFacets(),
  ]);

  const normalizedQuery = query.toLowerCase();
  const suggestions: SearchSuggestion[] = [
    ...products.slice(0, 5).map((product) => ({
      id: `product-${product.id}`,
      type: "product" as const,
      title: product.name,
      subtitle: product.category,
      href: `/products/${product.slug}`,
    })),
    ...facets.categories
      .filter((category) => category.toLowerCase().includes(normalizedQuery))
      .slice(0, 3)
      .map((category) => ({
        id: `category-${category}`,
        type: "category" as const,
        title: category,
        subtitle: "Product category",
        href: `/products?category=${encodeURIComponent(category)}`,
      })),
  ];

  return NextResponse.json({ suggestions: suggestions.slice(0, 8) });
}
