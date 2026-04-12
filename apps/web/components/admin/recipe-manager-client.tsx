"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type Recipe, type RecipeStatus } from "@/lib/recipes/types";

type AdminRecipesResponse = {
  role: string;
  recipes: Recipe[];
};

type RecipeResponse = {
  role: string;
  recipe: Recipe;
};

type RecipeFormState = {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  status: RecipeStatus;
  prepMinutes: string;
  cookMinutes: string;
  servings: string;
  ingredientsText: string;
  stepsText: string;
  relatedProductsText: string;
  tagsText: string;
  calories: string;
  proteinG: string;
  carbsG: string;
  fatG: string;
};

const emptyForm: RecipeFormState = {
  slug: "",
  title: "",
  description: "",
  imageUrl: "/placeholders/section-image-placeholder.svg",
  status: "draft",
  prepMinutes: "0",
  cookMinutes: "0",
  servings: "1",
  ingredientsText: "",
  stepsText: "",
  relatedProductsText: "",
  tagsText: "",
  calories: "0",
  proteinG: "0",
  carbsG: "0",
  fatG: "0",
};

function parseLines(value: string) {
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function toForm(recipe: Recipe): RecipeFormState {
  return {
    slug: recipe.slug,
    title: recipe.title,
    description: recipe.description,
    imageUrl: recipe.imageUrl,
    status: recipe.status,
    prepMinutes: String(recipe.prepMinutes),
    cookMinutes: String(recipe.cookMinutes),
    servings: String(recipe.servings),
    ingredientsText: recipe.ingredients.join("\n"),
    stepsText: recipe.steps.join("\n"),
    relatedProductsText: recipe.relatedProductSlugs.join("\n"),
    tagsText: recipe.tags.join("\n"),
    calories: String(recipe.nutritionPerServing.calories),
    proteinG: String(recipe.nutritionPerServing.proteinG),
    carbsG: String(recipe.nutritionPerServing.carbsG),
    fatG: String(recipe.nutritionPerServing.fatG),
  };
}

function parseNumber(value: string, fallback = 0) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }
  return numericValue;
}

function buildPayload(form: RecipeFormState) {
  return {
    slug: form.slug.trim(),
    title: form.title.trim(),
    description: form.description.trim(),
    imageUrl: form.imageUrl.trim(),
    status: form.status,
    prepMinutes: Math.max(0, Math.round(parseNumber(form.prepMinutes))),
    cookMinutes: Math.max(0, Math.round(parseNumber(form.cookMinutes))),
    servings: Math.max(1, Math.round(parseNumber(form.servings, 1))),
    ingredients: parseLines(form.ingredientsText),
    steps: parseLines(form.stepsText),
    relatedProductSlugs: parseLines(form.relatedProductsText),
    tags: parseLines(form.tagsText),
    nutritionPerServing: {
      calories: Math.max(0, Math.round(parseNumber(form.calories))),
      proteinG: Math.max(0, parseNumber(form.proteinG)),
      carbsG: Math.max(0, parseNumber(form.carbsG)),
      fatG: Math.max(0, parseNumber(form.fatG)),
    },
  };
}

export function RecipeManagerClient() {
  const [role, setRole] = useState("Unknown");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [form, setForm] = useState<RecipeFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("Loading recipes...");

  const selectedRecipe = useMemo(
    () => recipes.find((entry) => entry.id === selectedRecipeId) ?? null,
    [recipes, selectedRecipeId],
  );
  const canWrite = role === "SUPER_ADMIN" || role === "CONTENT_EDITOR";

  const reloadRecipes = useCallback(async (preferredRecipeId?: string) => {
    const response = await fetch("/api/admin/cms/recipes", { cache: "no-store" });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to load recipes.");
      return;
    }

    const data = (await response.json()) as AdminRecipesResponse;
    setRole(data.role);
    setRecipes(data.recipes);

    const target = preferredRecipeId
      ? data.recipes.find((entry) => entry.id === preferredRecipeId)
      : data.recipes[0];

    if (target) {
      setSelectedRecipeId(target.id);
      setForm(toForm(target));
    } else {
      setSelectedRecipeId("");
      setForm(emptyForm);
    }

    setStatus("Recipe manager ready.");
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void reloadRecipes();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [reloadRecipes]);

  function updateForm(partial: Partial<RecipeFormState>) {
    setForm((current) => ({ ...current, ...partial }));
  }

  async function createRecipe() {
    if (!canWrite) {
      setStatus("This role has read-only access.");
      return;
    }

    setSaving(true);
    setStatus("Creating recipe...");
    const response = await fetch("/api/admin/cms/recipes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(buildPayload(form)),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to create recipe.");
      setSaving(false);
      return;
    }

    const data = (await response.json()) as RecipeResponse;
    await reloadRecipes(data.recipe.id);
    setStatus(`Created recipe ${data.recipe.title}.`);
    setSaving(false);
  }

  async function updateRecipe() {
    if (!selectedRecipeId) {
      setStatus("Select a recipe to update.");
      return;
    }
    if (!canWrite) {
      setStatus("This role has read-only access.");
      return;
    }

    setSaving(true);
    setStatus("Updating recipe...");
    const response = await fetch(`/api/admin/cms/recipes/${selectedRecipeId}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(buildPayload(form)),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to update recipe.");
      setSaving(false);
      return;
    }

    const data = (await response.json()) as RecipeResponse;
    await reloadRecipes(data.recipe.id);
    setStatus(`Updated recipe ${data.recipe.title}.`);
    setSaving(false);
  }

  async function deleteRecipe() {
    if (!selectedRecipeId) {
      setStatus("Select a recipe to delete.");
      return;
    }
    if (!canWrite) {
      setStatus("This role has read-only access.");
      return;
    }

    if (!window.confirm("Delete this recipe?")) {
      return;
    }

    setSaving(true);
    setStatus("Deleting recipe...");
    const response = await fetch(`/api/admin/cms/recipes/${selectedRecipeId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to delete recipe.");
      setSaving(false);
      return;
    }

    const data = (await response.json()) as RecipeResponse;
    await reloadRecipes();
    setStatus(`Deleted recipe ${data.recipe.title}.`);
    setSaving(false);
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
      <div className="space-y-2">
        <Badge>Recipe Admin</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Recipe Manager
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Role: <span className="font-semibold">{role}</span>. Create, edit, and publish recipe
          content.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Recipes</p>
          <select
            value={selectedRecipeId}
            onChange={(event) => {
              const nextId = event.target.value;
              setSelectedRecipeId(nextId);
              const target = recipes.find((entry) => entry.id === nextId);
              setForm(target ? toForm(target) : emptyForm);
            }}
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          >
            <option value="">New recipe form</option>
            {recipes.map((recipe) => (
              <option key={recipe.id} value={recipe.id}>
                {recipe.title} · {recipe.status}
              </option>
            ))}
          </select>

          {selectedRecipe ? (
            <div className="rounded-xl border border-neutral-200 p-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              <p>ID: {selectedRecipe.id}</p>
              <p>Updated: {selectedRecipe.updatedAt}</p>
              <p>Related products: {selectedRecipe.relatedProductSlugs.length}</p>
            </div>
          ) : null}

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {recipes.length} recipe{recipes.length === 1 ? "" : "s"} configured.
          </p>
          <Button variant="secondary" onClick={() => setForm(emptyForm)} disabled={saving}>
            Reset Form
          </Button>
        </Card>

        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Recipe Form
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              value={form.slug}
              onChange={(event) => updateForm({ slug: event.target.value })}
              placeholder="Slug"
            />
            <select
              value={form.status}
              onChange={(event) => updateForm({ status: event.target.value as RecipeStatus })}
              className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
            </select>
            <Input
              value={form.title}
              onChange={(event) => updateForm({ title: event.target.value })}
              placeholder="Recipe title"
            />
            <Input
              value={form.imageUrl}
              onChange={(event) => updateForm({ imageUrl: event.target.value })}
              placeholder="Image URL"
            />
            <Input
              type="number"
              min={0}
              value={form.prepMinutes}
              onChange={(event) => updateForm({ prepMinutes: event.target.value })}
              placeholder="Prep minutes"
            />
            <Input
              type="number"
              min={0}
              value={form.cookMinutes}
              onChange={(event) => updateForm({ cookMinutes: event.target.value })}
              placeholder="Cook minutes"
            />
            <Input
              type="number"
              min={1}
              value={form.servings}
              onChange={(event) => updateForm({ servings: event.target.value })}
              placeholder="Servings"
            />
          </div>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Description
            </span>
            <textarea
              value={form.description}
              onChange={(event) => updateForm({ description: event.target.value })}
              className="min-h-24 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                Ingredients (one per line)
              </span>
              <textarea
                value={form.ingredientsText}
                onChange={(event) => updateForm({ ingredientsText: event.target.value })}
                className="min-h-32 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                Steps (one per line)
              </span>
              <textarea
                value={form.stepsText}
                onChange={(event) => updateForm({ stepsText: event.target.value })}
                className="min-h-32 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                Related Product Slugs (one per line)
              </span>
              <textarea
                value={form.relatedProductsText}
                onChange={(event) => updateForm({ relatedProductsText: event.target.value })}
                className="min-h-24 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                Tags (one per line)
              </span>
              <textarea
                value={form.tagsText}
                onChange={(event) => updateForm({ tagsText: event.target.value })}
                className="min-h-24 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <Input
              type="number"
              min={0}
              step="1"
              value={form.calories}
              onChange={(event) => updateForm({ calories: event.target.value })}
              placeholder="Calories"
            />
            <Input
              type="number"
              min={0}
              step="0.1"
              value={form.proteinG}
              onChange={(event) => updateForm({ proteinG: event.target.value })}
              placeholder="Protein (g)"
            />
            <Input
              type="number"
              min={0}
              step="0.1"
              value={form.carbsG}
              onChange={(event) => updateForm({ carbsG: event.target.value })}
              placeholder="Carbs (g)"
            />
            <Input
              type="number"
              min={0}
              step="0.1"
              value={form.fatG}
              onChange={(event) => updateForm({ fatG: event.target.value })}
              placeholder="Fat (g)"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={createRecipe} disabled={saving || !canWrite}>
              {saving ? "Working..." : "Create Recipe"}
            </Button>
            <Button
              variant="secondary"
              onClick={updateRecipe}
              disabled={saving || !selectedRecipeId || !canWrite}
            >
              Update Recipe
            </Button>
            <Button
              variant="secondary"
              onClick={deleteRecipe}
              disabled={saving || !selectedRecipeId || !canWrite}
            >
              Delete Recipe
            </Button>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{status}</p>
          </div>
        </Card>
      </div>
    </section>
  );
}
