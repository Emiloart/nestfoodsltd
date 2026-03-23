import { z } from "zod";

const publicationStatusSchema = z.enum(["draft", "published", "scheduled"]);

const baseBannerSchema = z.object({
  label: z.string().trim().min(2).max(120),
  headline: z.string().trim().min(4).max(240),
  ctaLabel: z.string().trim().max(80).optional(),
  ctaHref: z.string().trim().max(260).optional(),
  imageUrl: z.string().trim().min(4).max(240),
  status: publicationStatusSchema,
  publishAt: z.string().trim().max(80).optional(),
  order: z.number().int().min(1).max(1000).optional(),
});

export const createBannerSchema = baseBannerSchema.extend({
  id: z.string().trim().max(160).optional(),
});

export const updateBannerSchema = baseBannerSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });
