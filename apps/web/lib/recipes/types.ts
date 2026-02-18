export type RecipeStatus = "draft" | "published";

export type Recipe = {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  status: RecipeStatus;
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  ingredients: string[];
  steps: string[];
  relatedProductSlugs: string[];
  tags: string[];
  nutritionPerServing: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  updatedAt: string;
};

export type RecipeSearchResult = Recipe & {
  matchedIngredients: string[];
  missingIngredients: string[];
  matchScore: number;
};

export type RecipeNutritionBundleItemInput = {
  variantId: string;
  quantity: number;
};

export type RecipeNutritionBundleLine = {
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
};

export type RecipeNutritionBundleSummary = {
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

export type RecipeData = {
  recipes: Recipe[];
};
