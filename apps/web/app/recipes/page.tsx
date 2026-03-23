import { RecipesPageClient } from "@/components/recipes/recipes-page-client";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Ingredients & Insights",
  description:
    "Search bread pairings, ingredient-led ideas, and product nutrition bundles built around the Nest Foods range.",
  path: "/recipes",
});

export default function RecipesPage() {
  return <RecipesPageClient />;
}
