import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { resolveB2BAdminRole } from "@/lib/b2b/admin";
import { updateB2BQuoteStatusAsAdmin } from "@/lib/b2b/service";

const statusSchema = z.object({
  status: z.enum(["submitted", "reviewing", "quoted", "approved", "rejected"]),
  note: z.string().trim().min(4).max(300),
});

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function PUT(request: NextRequest, context: RouteContext) {
  const role = resolveB2BAdminRole(request);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validated = statusSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: "Invalid quote status payload", details: validated.error.flatten() }, { status: 400 });
  }

  const { id } = await Promise.resolve(context.params);
  try {
    const quoteRequest = await updateB2BQuoteStatusAsAdmin(id, {
      status: validated.data.status,
      note: validated.data.note,
      role,
    });
    return NextResponse.json({ role, quoteRequest });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update quote status." }, { status: 400 });
  }
}
