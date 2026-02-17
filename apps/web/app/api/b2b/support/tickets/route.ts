import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getB2BSessionAccountId } from "@/lib/b2b/session";
import { createB2BSupportTicket, listB2BSupportTickets } from "@/lib/b2b/service";

const ticketSchema = z.object({
  subject: z.string().trim().min(4).max(160),
  description: z.string().trim().min(8).max(1200),
  channel: z.enum(["portal", "email", "phone", "whatsapp"]),
  priority: z.enum(["low", "normal", "high"]),
});

export async function GET(request: NextRequest) {
  const accountId = getB2BSessionAccountId(request);
  if (!accountId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const tickets = await listB2BSupportTickets(accountId);
  return NextResponse.json({ tickets });
}

export async function POST(request: NextRequest) {
  const accountId = getB2BSessionAccountId(request);
  if (!accountId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validated = ticketSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: "Invalid support ticket payload", details: validated.error.flatten() }, { status: 400 });
  }

  try {
    const ticket = await createB2BSupportTicket(accountId, validated.data);
    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create support ticket." }, { status: 400 });
  }
}
