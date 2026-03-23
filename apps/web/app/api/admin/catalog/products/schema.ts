import { z } from "zod";

export const nutritionItemSchema = z.object({
  label: z.string().trim().min(1).max(80),
  amount: z.number().min(0).max(100000),
  unit: z.string().trim().min(1).max(20),
});

export const productVariantSchema = z.object({
  id: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => value ?? ""),
  name: z.string().trim().min(2).max(120),
  sku: z.string().trim().min(2).max(120),
  sizeLabel: z.string().trim().max(40).optional(),
  stockStatus: z.enum(["in_stock", "low_stock", "out_of_stock"]),
  priceMinor: z.number().int().min(0).max(10_000_000_000),
  currency: z.enum(["NGN", "USD"]),
  subscriptionEligible: z.boolean(),
});

const baseProductSchema = z.object({
  slug: z.string().trim().min(3).max(160),
  status: z.enum(["draft", "published"]),
  availabilityStatus: z.enum(["available", "limited", "unavailable"]),
  availableRegions: z.array(z.string().trim().min(2).max(80)).min(1).max(25),
  minimumOrderQuantity: z.number().int().min(1).max(1_000_000),
  maximumOrderQuantity: z.number().int().min(1).max(1_000_000),
  name: z.string().trim().min(2).max(180),
  category: z.string().trim().min(2).max(120),
  shortDescription: z.string().trim().min(8).max(280),
  longDescription: z.string().trim().min(16).max(2200),
  imageUrl: z.string().trim().min(4).max(220),
  galleryUrls: z.array(z.string().trim().min(4).max(220)).max(12),
  tags: z.array(z.string().trim().min(1).max(60)).max(20),
  allergens: z.array(z.string().trim().min(1).max(120)).max(20),
  ingredients: z.array(z.string().trim().min(1).max(160)).max(50),
  shelfLifeDays: z.number().int().min(1).max(3650),
  nutritionTable: z.array(nutritionItemSchema).min(1).max(60),
  variants: z.array(productVariantSchema).min(1).max(20),
});

export const createProductSchema = baseProductSchema
  .extend({
    id: z.string().trim().max(160).optional(),
  })
  .refine((value) => value.maximumOrderQuantity >= value.minimumOrderQuantity, {
    message: "maximumOrderQuantity must be greater than or equal to minimumOrderQuantity.",
    path: ["maximumOrderQuantity"],
  });

export const updateProductSchema = baseProductSchema
  .partial()
  .superRefine((value, context) => {
    if (
      value.minimumOrderQuantity !== undefined &&
      value.maximumOrderQuantity !== undefined &&
      value.maximumOrderQuantity < value.minimumOrderQuantity
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "maximumOrderQuantity must be greater than or equal to minimumOrderQuantity.",
        path: ["maximumOrderQuantity"],
      });
    }
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });
