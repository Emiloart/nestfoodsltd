import { z } from "zod";

export const adminRoleSchema = z.enum(["SUPER_ADMIN", "CONTENT_EDITOR", "SALES_MANAGER"]);

export const createInviteSchema = z.object({
  email: z.string().trim().email(),
  role: adminRoleSchema,
  mfaRequired: z.boolean().optional(),
  expiresInHours: z.number().int().min(1).max(24 * 14).optional(),
});

export const updateAdminUserSchema = z
  .object({
    role: adminRoleSchema.optional(),
    status: z.enum(["active", "suspended"]).optional(),
    mfaRequired: z.boolean().optional(),
    newMfaCode: z
      .string()
      .trim()
      .regex(/^\d{6}$/)
      .optional(),
    resetFailedLogins: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.role !== undefined ||
      value.status !== undefined ||
      value.mfaRequired !== undefined ||
      value.newMfaCode !== undefined ||
      value.resetFailedLogins !== undefined,
    {
      message: "At least one update field is required.",
    },
  );
