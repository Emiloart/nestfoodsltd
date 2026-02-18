import { RecipesPageClient } from "@/components/recipes/recipes-page-client";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Recipes",
  description:
    "Find recipes by ingredient and estimate nutrition bundles with Nest Foods products.",
  path: "/recipes",
});

export default function RecipesPage() {
  return <RecipesPageClient />;
}
