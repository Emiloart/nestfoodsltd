import { unstable_noStore as noStore } from "next/cache";

import { readCommerceData } from "@/lib/commerce/store";

import { readRecipeData, writeRecipeData } from "./store";
import {
  type Recipe,
  type RecipeStatus,
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

type AdminCreateRecipeInput = Omit<Recipe, "id" | "updatedAt"> & {
  id?: string;
};

type AdminUpdateRecipeInput = Partial<Omit<Recipe, "id" | "updatedAt">>;

function buildRecipeId(slug: string) {
  return `recipe-${slug}-${crypto.randomUUID().slice(0, 8)}`;
}

function normalizeRecipeStatus(status: RecipeStatus): RecipeStatus {
  return status === "draft" ? "draft" : "published";
}

function ensureUniqueRecipeSlug(recipes: Recipe[], slug: string, recipeId?: string) {
  const normalizedSlug = slug.trim().toLowerCase();
  const duplicate = recipes.find(
    (entry) => entry.slug.toLowerCase() === normalizedSlug && entry.id !== recipeId,
  );
  if (duplicate) {
    throw new Error("A recipe with this slug already exists.");
  }
}

function normalizeRecipeNutrition(input: Recipe["nutritionPerServing"]): Recipe["nutritionPerServing"] {
  return {
    calories: Math.max(0, Math.round(Number(input.calories))),
    proteinG: Math.max(0, Number(input.proteinG)),
    carbsG: Math.max(0, Number(input.carbsG)),
    fatG: Math.max(0, Number(input.fatG)),
  };
}

async function validateRelatedProductSlugs(slugs: string[]) {
  const commerce = await readCommerceData();
  const available = new Set(commerce.products.map((entry) => entry.slug));
  const missing = slugs.filter((slug) => !available.has(slug));
  if (missing.length > 0) {
    throw new Error(`Related products not found: ${missing.join(", ")}`);
  }
}

export async function listAdminRecipes() {
  noStore();
  const data = await readRecipeData();
  return data.recipes;
}

export async function getAdminRecipeById(recipeId: string) {
  noStore();
  const data = await readRecipeData();
  return data.recipes.find((entry) => entry.id === recipeId) ?? null;
}

export async function createAdminRecipe(input: AdminCreateRecipeInput) {
  const data = await readRecipeData();
  ensureUniqueRecipeSlug(data.recipes, input.slug);

  const recipeId = input.id?.trim() || buildRecipeId(input.slug);
  if (data.recipes.some((entry) => entry.id === recipeId)) {
    throw new Error("A recipe with this id already exists.");
  }

  const relatedProductSlugs = input.relatedProductSlugs.map((entry) => entry.trim()).filter(Boolean);
  await validateRelatedProductSlugs(relatedProductSlugs);

  const recipe: Recipe = {
    id: recipeId,
    slug: input.slug.trim().toLowerCase(),
    title: input.title.trim(),
    description: input.description.trim(),
    imageUrl: input.imageUrl.trim(),
    status: normalizeRecipeStatus(input.status),
    prepMinutes: Math.max(0, Math.round(Number(input.prepMinutes))),
    cookMinutes: Math.max(0, Math.round(Number(input.cookMinutes))),
    servings: Math.max(1, Math.round(Number(input.servings))),
    ingredients: input.ingredients.map((entry) => entry.trim()).filter(Boolean),
    steps: input.steps.map((entry) => entry.trim()).filter(Boolean),
    relatedProductSlugs,
    tags: input.tags.map((entry) => entry.trim()).filter(Boolean),
    nutritionPerServing: normalizeRecipeNutrition(input.nutritionPerServing),
    updatedAt: new Date().toISOString(),
  };

  data.recipes.unshift(recipe);
  await writeRecipeData(data);
  return recipe;
}

export async function updateAdminRecipe(recipeId: string, input: AdminUpdateRecipeInput) {
  const data = await readRecipeData();
  const recipe = data.recipes.find((entry) => entry.id === recipeId);
  if (!recipe) {
    throw new Error("Recipe not found.");
  }

  const nextSlug = input.slug ? input.slug.trim().toLowerCase() : recipe.slug;
  ensureUniqueRecipeSlug(data.recipes, nextSlug, recipeId);

  if (input.title !== undefined) {
    recipe.title = input.title.trim();
  }
  recipe.slug = nextSlug;
  if (input.description !== undefined) {
    recipe.description = input.description.trim();
  }
  if (input.imageUrl !== undefined) {
    recipe.imageUrl = input.imageUrl.trim();
  }
  if (input.status !== undefined) {
    recipe.status = normalizeRecipeStatus(input.status);
  }
  if (input.prepMinutes !== undefined) {
    recipe.prepMinutes = Math.max(0, Math.round(Number(input.prepMinutes)));
  }
  if (input.cookMinutes !== undefined) {
    recipe.cookMinutes = Math.max(0, Math.round(Number(input.cookMinutes)));
  }
  if (input.servings !== undefined) {
    recipe.servings = Math.max(1, Math.round(Number(input.servings)));
  }
  if (input.ingredients !== undefined) {
    recipe.ingredients = input.ingredients.map((entry) => entry.trim()).filter(Boolean);
  }
  if (input.steps !== undefined) {
    recipe.steps = input.steps.map((entry) => entry.trim()).filter(Boolean);
  }
  if (input.relatedProductSlugs !== undefined) {
    const relatedProductSlugs = input.relatedProductSlugs.map((entry) => entry.trim()).filter(Boolean);
    await validateRelatedProductSlugs(relatedProductSlugs);
    recipe.relatedProductSlugs = relatedProductSlugs;
  }
  if (input.tags !== undefined) {
    recipe.tags = input.tags.map((entry) => entry.trim()).filter(Boolean);
  }
  if (input.nutritionPerServing !== undefined) {
    recipe.nutritionPerServing = normalizeRecipeNutrition(input.nutritionPerServing);
  }
  recipe.updatedAt = new Date().toISOString();

  await writeRecipeData(data);
  return recipe;
}

export async function deleteAdminRecipe(recipeId: string) {
  const data = await readRecipeData();
  const index = data.recipes.findIndex((entry) => entry.id === recipeId);
  if (index < 0) {
    throw new Error("Recipe not found.");
  }

  const recipe = data.recipes[index];
  if (!recipe) {
    throw new Error("Recipe not found.");
  }
  data.recipes.splice(index, 1);
  await writeRecipeData(data);
  return recipe;
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
