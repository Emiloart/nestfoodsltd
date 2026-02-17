import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createOrGetCustomerProfile, CUSTOMER_SESSION_COOKIE_NAME } from "@/lib/customer/service";

const sessionSchema = z.object({
  email: z.string().trim().email(),
  fullName: z.string().trim().max(120).optional(),
});

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}

export async function GET(request: NextRequest) {
  const email = request.cookies.get(CUSTOMER_SESSION_COOKIE_NAME)?.value;
  if (!email) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const profile = await createOrGetCustomerProfile(email);
  return NextResponse.json({ authenticated: true, profile });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const validated = sessionSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: "Invalid session payload" }, { status: 400 });
  }

  const profile = await createOrGetCustomerProfile(validated.data.email, validated.data.fullName);
  const response = NextResponse.json({ authenticated: true, profile });
  response.cookies.set(CUSTOMER_SESSION_COOKIE_NAME, profile.email, cookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(CUSTOMER_SESSION_COOKIE_NAME, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
  return response;
}
