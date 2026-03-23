import { z } from "zod";

const nutritionSchema = z.object({
  calories: z.number().min(0).max(50_000),
  proteinG: z.number().min(0).max(5_000),
  carbsG: z.number().min(0).max(5_000),
  fatG: z.number().min(0).max(5_000),
});

const baseRecipeSchema = z.object({
  slug: z.string().trim().min(3).max(180),
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().min(8).max(1200),
  imageUrl: z.string().trim().min(4).max(260),
  status: z.enum(["draft", "published"]),
  prepMinutes: z.number().int().min(0).max(2000),
  cookMinutes: z.number().int().min(0).max(2000),
  servings: z.number().int().min(1).max(200),
  ingredients: z.array(z.string().trim().min(1).max(180)).min(1).max(80),
  steps: z.array(z.string().trim().min(1).max(500)).min(1).max(80),
  relatedProductSlugs: z.array(z.string().trim().min(1).max(180)).max(40),
  tags: z.array(z.string().trim().min(1).max(120)).max(40),
  nutritionPerServing: nutritionSchema,
});

export const createRecipeSchema = baseRecipeSchema.extend({
  id: z.string().trim().max(200).optional(),
});

export const updateRecipeSchema = baseRecipeSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });
