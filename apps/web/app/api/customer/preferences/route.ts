import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCustomerSessionEmail } from "@/lib/customer/session";
import { getCustomerPreferences, updateCustomerPreferences } from "@/lib/customer/service";

const updatePreferencesSchema = z.object({
  locale: z.enum(["en-NG", "ha-NG", "yo-NG", "ig-NG", "fr-FR"]).optional(),
  currency: z.enum(["NGN", "USD"]).optional(),
  dietaryTags: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  interests: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  notifications: z
    .object({
      orderUpdates: z.boolean().optional(),
      marketingEmails: z.boolean().optional(),
      smsAlerts: z.boolean().optional(),
    })
    .optional(),
  newsletter: z
    .object({
      subscribed: z.boolean().optional(),
      topics: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
      frequency: z.enum(["weekly", "biweekly", "monthly"]).optional(),
    })
    .optional(),
});

export async function GET(request: NextRequest) {
  const email = getCustomerSessionEmail(request);
  if (!email) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const preferences = await getCustomerPreferences(email);
  return NextResponse.json({ preferences });
}

export async function PUT(request: NextRequest) {
  const email = getCustomerSessionEmail(request);
  if (!email) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validated = updatePreferencesSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: "Invalid preferences payload", details: validated.error.flatten() },
      { status: 400 },
    );
  }

  const preferences = await updateCustomerPreferences(email, validated.data);
  return NextResponse.json({ preferences });
}
