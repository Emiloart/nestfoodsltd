import { z } from "zod";

export const nutritionNoteSchema = z.object({
  label: z.string().trim().min(1).max(80),
  value: z.string().trim().min(1).max(280),
});

export const galleryImageSchema = z.object({
  url: z.string().trim().min(4).max(2_100_000),
  altText: z.string().trim().min(2).max(180),
  label: z.string().trim().max(120).optional(),
});

export const packFormatSchema = z.object({
  id: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => value ?? ""),
  label: z.string().trim().min(2).max(140),
});

const baseProductSchema = z.object({
  slug: z.string().trim().min(3).max(160),
  status: z.enum(["draft", "published"]),
  name: z.string().trim().min(2).max(180),
  category: z.string().trim().min(2).max(120),
  shortDescription: z.string().trim().min(8).max(280),
  longDescription: z.string().trim().min(16).max(2200),
  imageUrl: z.string().trim().min(4).max(2_100_000),
  galleryUrls: z.array(z.string().trim().min(4).max(2_100_000)).max(12),
  galleryImages: z.array(galleryImageSchema).max(12).optional(),
  allergens: z.array(z.string().trim().min(1).max(120)).max(20),
  ingredients: z.array(z.string().trim().min(1).max(160)).max(50),
  nutritionNotes: z.array(nutritionNoteSchema).max(30),
  nutrition: z.array(nutritionNoteSchema).max(30).optional(),
  packFormats: z.array(packFormatSchema).min(1).max(20),
  bestFor: z.array(z.string().trim().min(1).max(140)).max(12),
  shelfLife: z.string().trim().max(160).optional(),
  storageInstructions: z.array(z.string().trim().min(1).max(180)).max(12).optional(),
});

export const createProductSchema = baseProductSchema.extend({
  id: z.string().trim().max(160).optional(),
});

export const updateProductSchema = baseProductSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: "At least one field is required.",
  },
);
