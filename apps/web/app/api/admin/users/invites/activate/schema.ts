import { z } from "zod";

export const activateInviteSchema = z.object({
  inviteToken: z.string().trim().min(20),
  fullName: z.string().trim().min(2).max(120),
  password: z.string().trim().min(12).max(128),
  mfaCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/)
    .optional(),
});
