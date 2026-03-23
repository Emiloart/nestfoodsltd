import { z } from "zod";

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "created",
    "payment_pending",
    "paid",
    "processing",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ]),
  note: z.string().trim().max(400).optional(),
});
