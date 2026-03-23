import { z } from "zod";

export const askChatSchema = z.object({
  message: z.string().trim().min(1).max(1200),
  conversationId: z.string().trim().max(140).optional(),
  sessionId: z.string().trim().max(140).optional(),
});
