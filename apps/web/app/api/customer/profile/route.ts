import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  createOrGetCustomerProfile,
  getCustomerProfileByEmail,
  updateCustomerProfile,
} from "@/lib/customer/service";
import { getCustomerSessionEmail } from "@/lib/customer/session";

const updateProfileSchema = z.object({
  fullName: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  addresses: z.array(z.string().trim().max(240)).optional(),
});

export async function GET(request: NextRequest) {
  const email = getCustomerSessionEmail(request);
  if (!email) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const profile = (await getCustomerProfileByEmail(email)) ?? (await createOrGetCustomerProfile(email));
  return NextResponse.json({ profile });
}

export async function PUT(request: NextRequest) {
  const email = getCustomerSessionEmail(request);
  if (!email) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validated = updateProfileSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: "Invalid profile payload", details: validated.error.flatten() }, { status: 400 });
  }

  try {
    const profile = await updateCustomerProfile(email, validated.data);
    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Profile update failed." }, { status: 400 });
  }
}
