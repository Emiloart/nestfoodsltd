import { z } from "zod";

const baseMediaSchema = z.object({
  label: z.string().trim().min(2).max(140),
  kind: z.enum(["image", "video"]).default("image"),
  url: z.string().trim().min(4).max(260),
  altText: z.string().trim().max(240).optional(),
  posterImageUrl: z.string().trim().max(260).optional(),
  folder: z.string().trim().min(1).max(140),
});

export const createMediaSchema = baseMediaSchema.extend({
  id: z.string().trim().max(180).optional(),
});

export const updateMediaSchema = baseMediaSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });
