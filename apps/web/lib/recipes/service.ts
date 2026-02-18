import { unstable_noStore as noStore } from "next/cache";

import { readCommerceData } from "@/lib/commerce/store";

import { readRecipeData } from "./store";
import {
  type Recipe,
  type RecipeNutritionBundleItemInput,
  type RecipeNutritionBundleLine,
  type RecipeNutritionBundleSummary,
  type RecipeSearchResult,
} from "./types";

function normalizeToken(value: string) {
  return value.trim().toLowerCase();
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((entry) => normalizeToken(entry)).filter(Boolean))];
}

function parseIngredientQuery(value?: string) {
  if (!value) {
    return [];
  }
  return uniqueStrings(value.split(","));
}

function computeRecipeMatch(recipe: Recipe, normalizedIngredients: string[]): RecipeSearchResult {
  const recipeIngredients = uniqueStrings(recipe.ingredients);
  const matchedIngredients = recipeIngredients.filter((entry) =>
    normalizedIngredients.some((token) => entry.includes(token) || token.includes(entry)),
  );
  const missingIngredients = recipeIngredients.filter(
    (entry) => !matchedIngredients.includes(entry),
  );
  const matchScore =
    recipeIngredients.length === 0 ? 0 : matchedIngredients.length / recipeIngredients.length;

  return {
    ...recipe,
    matchedIngredients,
    missingIngredients,
    matchScore,
  };
}

export async function listPublishedRecipes() {
  noStore();
  const data = await readRecipeData();
  return data.recipes.filter((entry) => entry.status === "published");
}

export async function listRecipeIngredients() {
  noStore();
  const recipes = await listPublishedRecipes();
  return uniqueStrings(recipes.flatMap((recipe) => recipe.ingredients));
}

export async function searchRecipes(filters?: { ingredients?: string; search?: string }) {
  noStore();
  const recipes = await listPublishedRecipes();
  const ingredientTokens = parseIngredientQuery(filters?.ingredients);
  const searchToken = normalizeToken(filters?.search ?? "");

  let filtered = recipes;
  if (searchToken) {
    filtered = filtered.filter((recipe) => {
      const haystack = [
        recipe.title,
        recipe.description,
        recipe.tags.join(" "),
        recipe.ingredients.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(searchToken);
    });
  }

  const results = filtered.map((recipe) => computeRecipeMatch(recipe, ingredientTokens));
  return results.sort((a, b) => {
    if (a.matchScore !== b.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return a.title.localeCompare(b.title);
  });
}

function extractNutritionValue(
  table: { label: string; amount: number; unit: string }[],
  targetLabel: string,
): number {
  return table
    .filter((entry) => normalizeToken(entry.label) === normalizeToken(targetLabel))
    .reduce((sum, entry) => sum + entry.amount, 0);
}

export async function calculateRecipeNutritionBundle(items: RecipeNutritionBundleItemInput[]) {
  noStore();
  const commerce = await readCommerceData();

  const lines: RecipeNutritionBundleLine[] = [];
  for (const item of items) {
    const quantity = Math.max(1, Math.floor(item.quantity));
    const product = commerce.products.find(
      (entry) =>
        entry.status === "published" &&
        entry.variants.some((variant) => variant.id === item.variantId),
    );
    if (!product) {
      continue;
    }
    const variant = product.variants.find((entry) => entry.id === item.variantId);
    if (!variant) {
      continue;
    }

    lines.push({
      variantId: variant.id,
      productSlug: product.slug,
      productName: product.name,
      variantName: variant.name,
      quantity,
      nutritionTable: product.nutritionTable.map((entry) => ({
        label: entry.label,
        amount: entry.amount * quantity,
        unit: entry.unit,
      })),
    });
  }

  if (lines.length === 0) {
    return {
      lines: [],
      summary: {
        totals: [],
        calories: 0,
        proteinG: 0,
        carbsG: 0,
        fatG: 0,
      } satisfies RecipeNutritionBundleSummary,
    };
  }

  const totalsMap = new Map<string, { label: string; unit: string; amount: number }>();
  for (const line of lines) {
    for (const entry of line.nutritionTable) {
      const key = `${normalizeToken(entry.label)}:${normalizeToken(entry.unit)}`;
      const existing = totalsMap.get(key);
      if (existing) {
        existing.amount += entry.amount;
      } else {
        totalsMap.set(key, { label: entry.label, unit: entry.unit, amount: entry.amount });
      }
    }
  }

  const totals = [...totalsMap.values()].sort((a, b) => a.label.localeCompare(b.label));
  const summary: RecipeNutritionBundleSummary = {
    totals: totals.map((entry) => ({
      label: entry.label,
      unit: entry.unit,
      amount: Number(entry.amount.toFixed(2)),
    })),
    calories: Number(
      totals
        .reduce(
          (sum, entry) => (normalizeToken(entry.label) === "energy" ? sum + entry.amount : sum),
          0,
        )
        .toFixed(2),
    ),
    proteinG: Number(
      lines
        .reduce((sum, line) => sum + extractNutritionValue(line.nutritionTable, "Protein"), 0)
        .toFixed(2),
    ),
    carbsG: Number(
      lines
        .reduce((sum, line) => sum + extractNutritionValue(line.nutritionTable, "Carbohydrates"), 0)
        .toFixed(2),
    ),
    fatG: Number(
      lines
        .reduce((sum, line) => sum + extractNutritionValue(line.nutritionTable, "Fat"), 0)
        .toFixed(2),
    ),
  };

  return { lines, summary };
}
