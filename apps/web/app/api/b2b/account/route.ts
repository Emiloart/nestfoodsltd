import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getB2BSessionAccountId } from "@/lib/b2b/session";
import { getB2BAccountById, updateB2BAccountProfile } from "@/lib/b2b/service";

const updateSchema = z.object({
  companyName: z.string().trim().min(2).max(140).optional(),
  contactName: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  regions: z.array(z.string().trim().min(2).max(80)).max(12).optional(),
});

export async function GET(request: NextRequest) {
  const accountId = getB2BSessionAccountId(request);
  if (!accountId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const account = await getB2BAccountById(accountId);
  if (!account) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  return NextResponse.json({ account });
}

export async function PUT(request: NextRequest) {
  const accountId = getB2BSessionAccountId(request);
  if (!accountId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validated = updateSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: "Invalid account payload", details: validated.error.flatten() }, { status: 400 });
  }

  try {
    const account = await updateB2BAccountProfile(accountId, validated.data);
    return NextResponse.json({ account });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update account." }, { status: 400 });
  }
}
