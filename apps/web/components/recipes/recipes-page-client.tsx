"use client";

import { useEffect, useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useExperience } from "@/components/customer/experience-provider";
import { type RecipeSearchResult } from "@/lib/recipes/types";

type RecipeSearchResponse = {
  recipes: RecipeSearchResult[];
};

type IngredientsResponse = {
  ingredients: string[];
};

type ProductsResponse = {
  products: {
    id: string;
    slug: string;
    name: string;
    variants: {
      id: string;
      name: string;
      currency: "NGN" | "USD";
      priceMinor: number;
    }[];
  }[];
};

type NutritionCalculatorResponse = {
  lines: {
    variantId: string;
    productSlug: string;
    productName: string;
    variantName: string;
    quantity: number;
    nutritionTable: {
      label: string;
      amount: number;
      unit: string;
    }[];
  }[];
  summary: {
    totals: {
      label: string;
      amount: number;
      unit: string;
    }[];
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
};

export function RecipesPageClient() {
  const { formatMinorAmount } = useExperience();

  const [ingredientsHint, setIngredientsHint] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<RecipeSearchResult[]>([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("Search by ingredients to discover recipes.");

  const [variantOptions, setVariantOptions] = useState<
    Array<{
      id: string;
      productName: string;
      variantName: string;
      currency: "NGN" | "USD";
      priceMinor: number;
    }>
  >([]);
  const [bundleVariantId, setBundleVariantId] = useState("");
  const [bundleQuantity, setBundleQuantity] = useState(1);
  const [bundleItems, setBundleItems] = useState<Array<{ variantId: string; quantity: number }>>(
    [],
  );
  const [nutritionResult, setNutritionResult] = useState<NutritionCalculatorResponse | null>(null);

  useEffect(() => {
    async function bootstrap() {
      const [ingredientsResponse, recipesResponse, productsResponse] = await Promise.all([
        fetch("/api/recipes/ingredients"),
        fetch("/api/recipes/search"),
        fetch("/api/commerce/products"),
      ]);

      if (ingredientsResponse.ok) {
        const data = (await ingredientsResponse.json()) as IngredientsResponse;
        setIngredientsHint(data.ingredients);
      }
      if (recipesResponse.ok) {
        const data = (await recipesResponse.json()) as RecipeSearchResponse;
        setRecipes(data.recipes);
      }
      if (productsResponse.ok) {
        const data = (await productsResponse.json()) as ProductsResponse;
        const options = data.products.flatMap((product) =>
          product.variants.map((variant) => ({
            id: variant.id,
            productName: product.name,
            variantName: variant.name,
            currency: variant.currency,
            priceMinor: variant.priceMinor,
          })),
        );
        setVariantOptions(options);
        if (options[0]) {
          setBundleVariantId(options[0].id);
        }
      }
    }

    void bootstrap();
  }, []);

  const hydratedBundleItems = useMemo(
    () =>
      bundleItems
        .map((item) => {
          const option = variantOptions.find((entry) => entry.id === item.variantId);
          if (!option) {
            return null;
          }
          return {
            ...item,
            ...option,
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    [bundleItems, variantOptions],
  );

  async function runRecipeSearch() {
    const searchParams = new URLSearchParams();
    if (ingredientInput.trim()) {
      searchParams.set("ingredients", ingredientInput.trim());
    }
    if (searchInput.trim()) {
      searchParams.set("search", searchInput.trim());
    }

    const response = await fetch(`/api/recipes/search?${searchParams.toString()}`);
    if (!response.ok) {
      setStatus("Recipe search failed.");
      return;
    }

    const data = (await response.json()) as RecipeSearchResponse;
    setRecipes(data.recipes);
    setStatus(`Found ${data.recipes.length} recipe matches.`);
  }

  function addBundleItem() {
    if (!bundleVariantId || !Number.isFinite(bundleQuantity) || bundleQuantity <= 0) {
      return;
    }
    setBundleItems((current) => {
      const existing = current.find((entry) => entry.variantId === bundleVariantId);
      if (!existing) {
        return [...current, { variantId: bundleVariantId, quantity: Math.floor(bundleQuantity) }];
      }
      return current.map((entry) =>
        entry.variantId === bundleVariantId
          ? { ...entry, quantity: entry.quantity + Math.floor(bundleQuantity) }
          : entry,
      );
    });
  }

  function removeBundleItem(variantId: string) {
    setBundleItems((current) => current.filter((entry) => entry.variantId !== variantId));
  }

  async function calculateNutrition() {
    if (bundleItems.length === 0) {
      return;
    }

    const response = await fetch("/api/recipes/nutrition-calculator", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: bundleItems }),
    });
    if (!response.ok) {
      setStatus("Nutrition calculation failed.");
      return;
    }

    const data = (await response.json()) as NutritionCalculatorResponse;
    setNutritionResult(data);
    setStatus("Nutrition bundle summary updated.");
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Recipe Finder & Nutrition Calculator
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Discover recipes by available ingredients and estimate nutrition totals for product
          bundles.
        </p>
      </div>

      <Card className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          Recipe Finder
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            value={ingredientInput}
            onChange={(event) => setIngredientInput(event.target.value)}
            placeholder="Ingredients you have (comma separated)"
          />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by recipe title or tag"
          />
        </div>
        <Button onClick={runRecipeSearch}>Find Recipes</Button>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Ingredient ideas: {ingredientsHint.slice(0, 8).join(", ")}
        </p>

        <div className="grid gap-3 lg:grid-cols-2">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {recipe.title}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Match {(recipe.matchScore * 100).toFixed(0)}%
                </p>
              </div>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                {recipe.description}
              </p>
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                Matched: {recipe.matchedIngredients.join(", ") || "None"}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Missing: {recipe.missingIngredients.slice(0, 5).join(", ") || "None"}
              </p>
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                {recipe.prepMinutes + recipe.cookMinutes} min total · serves {recipe.servings}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          Bundle Nutrition Calculator
        </p>
        <div className="grid gap-3 md:grid-cols-[1fr_140px_auto]">
          <select
            value={bundleVariantId}
            onChange={(event) => setBundleVariantId(event.target.value)}
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          >
            <option value="">Select variant</option>
            {variantOptions.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.productName} · {variant.variantName} (
                {formatMinorAmount(variant.priceMinor, variant.currency)})
              </option>
            ))}
          </select>
          <Input
            type="number"
            min={1}
            value={bundleQuantity}
            onChange={(event) => setBundleQuantity(Number(event.target.value))}
          />
          <Button onClick={addBundleItem} disabled={!bundleVariantId || bundleQuantity <= 0}>
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {hydratedBundleItems.length === 0 ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              No bundle items added yet.
            </p>
          ) : (
            hydratedBundleItems.map((item) => (
              <div
                key={item.variantId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
              >
                <p className="text-sm text-neutral-700 dark:text-neutral-200">
                  {item.productName} · {item.variantName} × {item.quantity}
                </p>
                <Button size="sm" variant="ghost" onClick={() => removeBundleItem(item.variantId)}>
                  Remove
                </Button>
              </div>
            ))
          )}
        </div>

        <Button
          variant="secondary"
          onClick={calculateNutrition}
          disabled={bundleItems.length === 0}
        >
          Calculate Nutrition
        </Button>

        {nutritionResult ? (
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Macro Summary
              </p>
              <p className="text-sm text-neutral-700 dark:text-neutral-200">
                Calories: {nutritionResult.summary.calories}
              </p>
              <p className="text-sm text-neutral-700 dark:text-neutral-200">
                Protein: {nutritionResult.summary.proteinG}g
              </p>
              <p className="text-sm text-neutral-700 dark:text-neutral-200">
                Carbs: {nutritionResult.summary.carbsG}g
              </p>
              <p className="text-sm text-neutral-700 dark:text-neutral-200">
                Fat: {nutritionResult.summary.fatG}g
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Detailed Totals
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {nutritionResult.summary.totals.map((entry) => (
                  <div
                    key={`${entry.label}-${entry.unit}`}
                    className="rounded-lg border border-neutral-200 p-2 dark:border-neutral-800"
                  >
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{entry.label}</p>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {entry.amount}
                      {entry.unit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Card>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">{status}</p>
    </section>
  );
}
