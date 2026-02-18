import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { RECIPE_SEED_DATA } from "./seed";
import { type RecipeData } from "./types";

const relativeDataFilePath = path.join("data", "recipes.json");

function resolveDataFilePath() {
  const candidates = [
    path.join(process.cwd(), relativeDataFilePath),
    path.join(process.cwd(), "apps", "web", relativeDataFilePath),
  ];
  const existingPath = candidates.find((candidatePath) => existsSync(candidatePath));
  return existingPath ?? candidates[0];
}

const dataFilePath = resolveDataFilePath();
const storageDriver = process.env.RECIPES_STORAGE_DRIVER ?? "json";

function mergeRecipeData(input: Partial<RecipeData> | null | undefined): RecipeData {
  if (!input) {
    return structuredClone(RECIPE_SEED_DATA);
  }

  return {
    recipes: input.recipes ?? RECIPE_SEED_DATA.recipes,
  };
}

export async function readRecipeData(): Promise<RecipeData> {
  if (storageDriver !== "json") {
    throw new Error("RECIPES_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.");
  }

  try {
    const raw = await readFile(dataFilePath, "utf8");
    return mergeRecipeData(JSON.parse(raw) as Partial<RecipeData>);
  } catch {
    await writeRecipeData(RECIPE_SEED_DATA);
    return RECIPE_SEED_DATA;
  }
}

export async function writeRecipeData(data: RecipeData) {
  if (storageDriver !== "json") {
    throw new Error("RECIPES_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.");
  }

  await mkdir(path.dirname(dataFilePath), { recursive: true });
  await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}
