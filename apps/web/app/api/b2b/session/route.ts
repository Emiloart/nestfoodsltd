import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getB2BSessionAccountId } from "@/lib/b2b/session";
import { B2B_SESSION_COOKIE_NAME, createOrGetB2BAccount, getB2BAccountById } from "@/lib/b2b/service";

const sessionSchema = z.object({
  companyName: z.string().trim().min(2).max(140),
  contactName: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().max(40).optional(),
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
  const accountId = getB2BSessionAccountId(request);
  if (!accountId) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const account = await getB2BAccountById(accountId);
  if (!account) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, account });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const validated = sessionSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: "Invalid B2B sign-in payload", details: validated.error.flatten() }, { status: 400 });
  }

  const account = await createOrGetB2BAccount(validated.data);
  const response = NextResponse.json({ authenticated: true, account });
  response.cookies.set(B2B_SESSION_COOKIE_NAME, account.id, cookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(B2B_SESSION_COOKIE_NAME, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
  return response;
}
