import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { resolveB2BAdminRole } from "@/lib/b2b/admin";
import { approveB2BAccount } from "@/lib/b2b/service";

const approvalSchema = z.object({
  tier: z.enum(["starter", "growth", "enterprise"]),
  accountManagerName: z.string().trim().min(2).max(120),
  accountManagerEmail: z.string().trim().email(),
  accountManagerPhone: z.string().trim().max(40).optional(),
  status: z.enum(["approved", "suspended"]).optional(),
  regions: z.array(z.string().trim().min(2).max(80)).max(12).optional(),
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
  const validated = approvalSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: "Invalid approval payload", details: validated.error.flatten() }, { status: 400 });
  }

  const { id } = await Promise.resolve(context.params);
  try {
    const account = await approveB2BAccount(id, validated.data);
    return NextResponse.json({ role, account });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update account approval." }, { status: 400 });
  }
}
