import { NextRequest, NextResponse } from "next/server";

import { listCommerceFacets, listCommerceProducts } from "@/lib/commerce/service";
import { readCmsData } from "@/lib/cms/store";

type SearchSuggestion = {
  id: string;
  type: "product" | "category" | "recipe";
  title: string;
  subtitle?: string;
  href: string;
};

function normalizeQuery(value: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

export async function GET(request: NextRequest) {
  const query = normalizeQuery(request.nextUrl.searchParams.get("q"));
  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const [products, facets, cms] = await Promise.all([
    listCommerceProducts({ search: query }),
    listCommerceFacets(),
    readCmsData(),
  ]);

  const productSuggestions: SearchSuggestion[] = products.slice(0, 6).map((product) => ({
    id: `product-${product.id}`,
    type: "product",
    title: product.name,
    subtitle: product.category,
    href: `/products/${product.slug}`,
  }));

  const categorySuggestions: SearchSuggestion[] = facets.categories
    .filter((entry) => entry.toLowerCase().includes(query))
    .slice(0, 3)
    .map((entry) => ({
      id: `category-${entry}`,
      type: "category",
      title: entry,
      subtitle: "Category",
      href: `/shop?category=${encodeURIComponent(entry)}`,
    }));

  const recipeSuggestions: SearchSuggestion[] = cms.recipes
    .filter((recipe) => recipe.status !== "draft")
    .filter((recipe) => {
      const haystack = [recipe.title, recipe.slug, recipe.ingredients.join(" ")].join(" ").toLowerCase();
      return haystack.includes(query);
    })
    .slice(0, 3)
    .map((recipe) => ({
      id: `recipe-${recipe.id}`,
      type: "recipe",
      title: recipe.title,
      subtitle: "Recipe",
      href: `/recipes#${recipe.slug}`,
    }));

  const seen = new Set<string>();
  const suggestions = [...productSuggestions, ...categorySuggestions, ...recipeSuggestions].filter((entry) => {
    if (seen.has(entry.href)) {
      return false;
    }
    seen.add(entry.href);
    return true;
  });

  return NextResponse.json({ suggestions: suggestions.slice(0, 10) });
}
