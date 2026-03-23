import { z } from "zod";

import { chatIntentValues } from "@/lib/chat/types";

export const createChatLeadSchema = z.object({
  conversationId: z.string().trim().max(140).optional(),
  sessionId: z.string().trim().max(140).optional(),
  name: z.string().trim().min(2).max(140).optional(),
  email: z.string().trim().email().max(240),
  phone: z.string().trim().max(40).optional(),
  company: z.string().trim().max(180).optional(),
  message: z.string().trim().min(4).max(1200),
  sourceIntent: z.enum(chatIntentValues).optional(),
});
